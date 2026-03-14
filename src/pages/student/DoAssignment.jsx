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
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, async (snap) => {
      if (snap.exists()) {
        const activeSession = snap.data().activeSession;
        if (activeSession && activeSession.status === 'active') {
          // Lấy bài quiz
          const quizSnap = await getDoc(doc(db, "quizzes", activeSession.quizId));
          if (quizSnap.exists()) {
            setQuiz(quizSnap.data());
            setIsSubmitted(false); // Reset trạng thái nếu có bài mới
          }
        } else {
          // Nếu giáo viên nhấn Finish Activity, activeSession sẽ null
          setQuiz(null);
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
      await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), {
        answers: answers,
        submittedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
    } catch (error) { console.error(error); }
  };

  if (!quiz) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#003366' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⏳</div>
        <h2 style={{ fontWeight: '800' }}>Đang chờ giáo viên...</h2>
        <p style={{ color: '#64748b' }}>Phòng: {roomId} | Học viên: {studentId}</p>
        <Button variant="outline" style={{ marginTop: '20px' }} onClick={() => navigate('/student/login')}>Thoát phòng</Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#003366' }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontWeight: '800' }}>Đã nộp bài!</h2>
        <p style={{ color: '#64748b' }}>Kết quả của bạn đã được ghi nhận. Vui lòng chờ hoạt động tiếp theo.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <header style={{ backgroundColor: '#003366', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>{quiz.title}</h1>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>{studentId}</div>
      </header>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
        {quiz.questions?.map((q, index) => (
          <div key={q.id} style={{ marginBottom: '30px', padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ marginTop: 0, color: '#003366', fontSize: '18px', marginBottom: '25px', lineHeight: '1.5' }}>
              <span style={{ color: '#94a3b8', marginRight: '8px' }}>{index + 1}.</span>{q.text}
            </h3>
            
            {(q.type === 'MCQ' || !q.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.options?.map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', padding: '15px', border: answers[q.id] === opt ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: answers[q.id] === opt ? '#f8fafc' : 'white', transition: 'all 0.2s', fontWeight: answers[q.id] === opt ? 'bold' : 'normal', color: '#334155' }}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ marginRight: '15px' }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'TF' && (
              <div style={{ display: 'flex', gap: '15px' }}>
                {['True', 'False'].map(opt => (
                  <label key={opt} style={{ flex: 1, textAlign: 'center', padding: '15px', border: answers[q.id] === opt ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: answers[q.id] === opt ? '#003366' : '#64748b', backgroundColor: answers[q.id] === opt ? '#f8fafc' : 'white' }}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ display: 'none' }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.type === 'SA' && (
              <textarea 
                rows="3" placeholder="Nhập câu trả lời..." value={answers[q.id] || ''} onChange={(e) => handleSelectOption(q.id, e.target.value)}
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontSize: '15px', color: '#334155', resize: 'vertical' }}
              />
            )}
          </div>
        ))}
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleSubmit}>Submit Answer</Button>
        </div>
      </div>
    </div>
  );
}