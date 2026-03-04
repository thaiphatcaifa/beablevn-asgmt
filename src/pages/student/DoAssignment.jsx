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
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Phòng thi: <span style={{ color: '#007bff' }}>{roomId}</span></h2>
        <p>Học viên hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.</p>
      </div>
      
      {mockQuestions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>Câu {index + 1}: {q.text}</h3>
          {q.options.map(opt => (
            <label key={opt} style={{ display: 'block', margin: '10px 0', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name={`question-${q.id}`} 
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => handleSelectOption(q.id, opt)}
                style={{ marginRight: '10px' }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <Button onClick={handleSubmit} variant="success">Nộp bài</Button>
    </div>
  );
}