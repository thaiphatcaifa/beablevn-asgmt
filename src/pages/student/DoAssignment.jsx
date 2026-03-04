import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';

export default function DoAssignment() {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const studentId = localStorage.getItem('currentStudentId');

  useEffect(() => {
    // 1. Kiểm tra phòng xem có activeSession không
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.activeSession && data.activeSession.status === 'active') {
          // 2. Lấy dữ liệu bài Quiz đang được Launch
          const quizSnap = await getDoc(doc(db, "quizzes", data.activeSession.quizId));
          if (quizSnap.exists()) {
            setQuiz(quizSnap.data());
          }
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleSelectOption = (questionId, val) => {
    setAnswers({ ...answers, [questionId]: val });
  };

  const handleSubmit = async () => {
    try {
      // 3. Ghi kết quả vào subcollection của Room để giáo viên thấy Live Results
      await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), {
        answers: answers,
        submittedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      alert("Nộp bài thành công! Đang chờ giáo viên chấm điểm...");
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
    }
  };

  if (isSubmitted) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '24px', color: '#16a34a', fontWeight: 'bold' }}>Bạn đã hoàn thành bài tập! 🎉</div>;
  }

  if (!quiz) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Đang chờ giáo viên khởi chạy bài tập...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#003366', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>{quiz.title}</h1>
        <div style={{ fontWeight: 'bold' }}>{studentId} | Phòng: {roomId}</div>
      </header>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        {quiz.questions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: '25px', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, color: '#003366', fontSize: '18px', marginBottom: '20px' }}>Câu {index + 1}: {q.text}</h3>
            
            {/* MULTIPLE CHOICE */}
            {(q.type === 'MCQ' || !q.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options?.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', border: answers[q.id] === opt ? '2px solid #e67e22' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: answers[q.id] === opt ? '#fffaf5' : 'white' }}>
                    <input type="radio" name={`question-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ marginRight: '15px' }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* TRUE / FALSE */}
            {q.type === 'TF' && (
              <div style={{ display: 'flex', gap: '15px' }}>
                {['True', 'False'].map(opt => (
                  <label key={opt} style={{ flex: 1, textAlign: 'center', padding: '15px', border: answers[q.id] === opt ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input type="radio" name={`question-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ display: 'none' }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* SHORT ANSWER */}
            {q.type === 'SA' && (
              <textarea 
                rows="4" 
                placeholder="Nhập câu trả lời của bạn..." 
                value={answers[q.id] || ''}
                onChange={(e) => handleSelectOption(q.id, e.target.value)}
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '16px' }}
              />
            )}
          </div>
        ))}
        <Button onClick={handleSubmit} variant="success">HOÀN THÀNH & NỘP BÀI</Button>
      </div>
    </div>
  );
}