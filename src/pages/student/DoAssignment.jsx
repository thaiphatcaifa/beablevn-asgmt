import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function DoAssignment() {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const mockQuestions = [
    { id: 1, text: "ReactJS được phát triển bởi công ty nào?", options: ["Google", "Facebook (Meta)", "Microsoft", "Twitter"] },
    { id: 2, text: "Hook nào được sử dụng để quản lý trạng thái trong Functional Component?", options: ["useEffect", "useContext", "useState", "useReducer"] }
  ];

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = () => {
    alert("Nộp bài thành công! Đang chờ giáo viên chấm điểm...");
    navigate('/'); 
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#003366', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>BeAble Assignment</h1>
        <div style={{ fontWeight: 'bold' }}>Phòng: {roomId}</div>
      </header>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        {mockQuestions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: '25px', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, color: '#003366', fontSize: '18px', marginBottom: '20px' }}>Câu {index + 1}: {q.text}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', border: answers[q.id] === opt ? '2px solid #e67e22' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: answers[q.id] === opt ? '#fffaf5' : 'white', transition: 'all 0.2s', fontWeight: answers[q.id] === opt ? 'bold' : 'normal' }}>
                  <input type="radio" name={`question-${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleSelectOption(q.id, opt)} style={{ marginRight: '15px', transform: 'scale(1.2)' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={handleSubmit} variant="success">HOÀN THÀNH & NỘP BÀI</Button>
      </div>
    </div>
  );
}