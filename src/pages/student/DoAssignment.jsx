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
          const quizSnap = await getDoc(doc(db, "quizzes", activeSession.quizId));
          if (quizSnap.exists()) {
            setQuiz(quizSnap.data());
            setIsSubmitted(false);
          }
        } else {
          setQuiz(null);
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Handle Input text và Dropdown
  const handleSelectOption = (questionId, val) => {
    setAnswers({ ...answers, [questionId]: val });
  };

  // Handle MCQ (hỗ trợ chọn nhiều đáp án bằng Checkbox)
  const handleToggleMCQ = (questionId, optionIndex) => {
    const currentAns = answers[questionId] || [];
    let newAns;
    if (currentAns.includes(optionIndex)) {
      newAns = currentAns.filter(i => i !== optionIndex);
    } else {
      newAns = [...currentAns, optionIndex];
    }
    setAnswers({ ...answers, [questionId]: newAns });
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
            
            {/* 1. MULTIPLE CHOICE */}
            {(q.type === 'MCQ' || !q.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {q.options?.map((opt, i) => {
                  const isChecked = (answers[q.id] || []).includes(i);
                  return (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', padding: '15px', border: isChecked ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: isChecked ? '#f8fafc' : 'white', transition: 'all 0.2s', fontWeight: isChecked ? 'bold' : 'normal', color: '#334155' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleToggleMCQ(q.id, i)} style={{ marginRight: '15px', width: '18px', height: '18px', cursor: 'pointer' }} />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {/* 2 & 3. TFNG / YNNG */}
            {['TFNG', 'YNNG'].includes(q.type) && (
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {(q.type === 'TFNG' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given']).map(opt => (
                  <label key={opt} style={{ flex: 1, minWidth: '120px', textAlign: 'center', padding: '15px', border: answers[q.id] === opt ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: answers[q.id] === opt ? '#003366' : '#64748b', backgroundColor: answers[q.id] === opt ? '#f8fafc' : 'white' }}>
                    <input type="radio" name={`q-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ display: 'none' }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* 4 -> 7. CÁC DẠNG MATCHING (Dropdown) */}
            {['MH', 'MI', 'MF', 'MSE'].includes(q.type) && (
              <div>
                <select 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontSize: '15px', color: '#334155', cursor: 'pointer' }}
                >
                  <option value="">-- Chọn đáp án phù hợp --</option>
                  {/* Gom toàn bộ options Match của dạng này trong quiz để làm Dropdown */}
                  {[...new Set(quiz.questions.filter(question => question.type === q.type).map(question => question.correctMatch))].filter(Boolean).sort().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 13. DIAGRAM LABEL COMPLETION (Có hiển thị ảnh) */}
            {q.type === 'DLC' && (
              <div style={{ marginBottom: '15px' }}>
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="Diagram for completion" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }} />
                )}
                <input 
                  type="text" 
                  placeholder={`Nhập nhãn sơ đồ (Max ${q.wordLimit || 3} words)...`} 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontSize: '15px', color: '#334155' }}
                />
              </div>
            )}

            {/* 8 -> 14. CÁC DẠNG COMPLETION & SAQ (Text Input) */}
            {['SC', 'SUMC', 'NC', 'TC', 'FC', 'SAQ'].includes(q.type) && (
              <div>
                <input 
                  type="text" 
                  placeholder={`Nhập câu trả lời (Max ${q.wordLimit || 3} words)...`} 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit', fontSize: '15px', color: '#334155' }}
                />
              </div>
            )}

          </div>
        ))}

        <div style={{ textAlign: 'right', marginTop: '40px' }}>
          <Button onClick={handleSubmit} style={{ backgroundColor: '#003366', color: 'white', fontWeight: '800', padding: '15px 40px', fontSize: '16px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
            Submit Answers
          </Button>
        </div>
      </div>
    </div>
  );
}