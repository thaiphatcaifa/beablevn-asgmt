import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function CreateExercise() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleSave = () => {
    if (!quizTitle.trim()) { alert("Vui lòng nhập tên bài tập!"); return; }
    alert(`Đã lưu bài tập: "${quizTitle}" với ${questions.length} câu hỏi!`);
    navigate('/teacher/exercises');
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#003366', margin: 0, fontWeight: '800' }}>Soạn bài tập mới</h2>
        <Button variant="danger" style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/teacher/exercises')}>
          Hủy bỏ
        </Button>
      </div>

      <Input label="Tên bài tập (Quiz Title)" placeholder="VD: Kiểm tra 15 phút Toán..." value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />

      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
        <h3 style={{ color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>Danh sách câu hỏi ({questions.length})</h3>
        {questions.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có câu hỏi nào. Hãy bấm thêm câu hỏi bên dưới.</p>}

        {questions.map((q, index) => (
          <div key={q.id} style={{ padding: '25px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
            <p style={{ margin: '0 0 15px 0', fontWeight: '700', color: '#e67e22', fontSize: '18px' }}>Câu hỏi {index + 1}</p>
            <Input placeholder="Nhập nội dung câu hỏi..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
              <Input placeholder="Đáp án A" />
              <Input placeholder="Đáp án B" />
              <Input placeholder="Đáp án C" />
              <Input placeholder="Đáp án D" />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <Button variant="success" style={{ width: 'auto' }} onClick={handleAddQuestion}>+ Thêm câu hỏi Trắc nghiệm</Button>
        <Button variant="primary" style={{ width: 'auto' }} onClick={handleSave}>💾 Lưu bài tập</Button>
      </div>
    </div>
  );
}