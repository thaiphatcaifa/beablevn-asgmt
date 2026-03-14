// src/pages/teacher/CreateExercise.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function CreateExercise() {
  const navigate = useNavigate();
  const { quizId } = useParams(); // Nếu có ID => Chế độ Edit
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quizId) {
      const fetchQuizData = async () => {
        setIsLoading(true);
        try {
          const docRef = doc(db, "quizzes", quizId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setQuizTitle(data.title || '');
            setQuestions(data.questions || []);
          } else {
            alert("Không tìm thấy bài tập này!");
            navigate('/teacher/exercises');
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu bài tập:", error);
        }
        setIsLoading(false);
      };
      fetchQuizData();
    }
  }, [quizId, navigate]);

  const addQuestion = (type) => {
    const newQ = { id: Date.now().toString(), type, text: '', points: 1 };
    if (type === 'MCQ') newQ.options = ['', '', '', ''];
    if (type === 'TF') newQ.correctOption = 'True';
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) { alert('Vui lòng nhập tên bài tập!'); return; }
    if (questions.length === 0) { alert('Vui lòng thêm ít nhất 1 câu hỏi!'); return; }

    setIsLoading(true);
    try {
      const targetId = quizId || 'q_' + Date.now();
      const quizData = {
        title: quizTitle,
        questions: questions,
        modified: new Date().toISOString().split('T')[0],
        isDeleted: false,
        folderId: null // Mặc định lưu ở thư mục gốc Library
      };
      
      await setDoc(doc(db, "quizzes", targetId), quizData, { merge: true });
      alert("Đã lưu bài tập thành công!");
      navigate('/teacher/exercises');
    } catch (error) {
      console.error("Lỗi lưu bài tập:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* HEADER TẠO BÀI TẬP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <button onClick={() => navigate('/teacher/exercises')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
            ← Back to Library
          </button>
          <h2 style={{ color: '#003366', margin: 0, fontSize: '28px', fontWeight: '800' }}>
            {quizId ? 'Chỉnh sửa Bài tập' : 'Tạo Bài tập mới'}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isLoading} style={{ backgroundColor: '#003366', color: 'white', fontWeight: '700', padding: '12px 30px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
          {isLoading ? 'Đang lưu...' : 'Lưu và Hoàn tất'}
        </Button>
      </div>

      {/* INPUT TITLE */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '10px', fontSize: '15px' }}>Tên bài tập</label>
        <input 
          type="text" 
          placeholder="Nhập tên bài tập... (VD: Midterm Math Test)" 
          value={quizTitle} 
          onChange={e => setQuizTitle(e.target.value)} 
          style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '16px', fontWeight: '500' }}
        />
      </div>

      {/* LIST CÂU HỎI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, index) => (
          <div key={q.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: '800', color: '#003366', fontSize: '16px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                Câu {index + 1} - {q.type === 'MCQ' ? 'Trắc nghiệm' : q.type === 'TF' ? 'Đúng / Sai' : 'Trả lời ngắn'}
              </span>
              <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                ✖ Xóa câu này
              </button>
            </div>

            <Input label="Nội dung câu hỏi" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} />

            <div style={{ marginTop: '20px' }}>
              {q.type === 'MCQ' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {q.options.map((opt, i) => (
                    <Input key={i} label={`Lựa chọn ${i + 1}`} value={opt} onChange={e => {
                      const newOpts = [...q.options];
                      newOpts[i] = e.target.value;
                      updateQuestion(q.id, 'options', newOpts);
                    }} />
                  ))}
                  <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <label style={{ fontWeight: '700', color: '#003366', fontSize: '14px' }}>Đáp án đúng: </label>
                    <select 
                      value={q.correctOption || 0} 
                      onChange={e => updateQuestion(q.id, 'correctOption', parseInt(e.target.value))} 
                      style={{ padding: '10px 16px', marginLeft: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155' }}
                    >
                      {q.options.map((_, i) => <option key={i} value={i}>Lựa chọn {i + 1}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {q.type === 'TF' && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontWeight: '700', color: '#003366', fontSize: '14px' }}>Đáp án đúng: </label>
                  <select 
                    value={q.correctOption || 'True'} 
                    onChange={e => updateQuestion(q.id, 'correctOption', e.target.value)} 
                    style={{ padding: '10px 16px', marginLeft: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155' }}
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {q.type === 'SA' && (
                <div style={{ marginTop: '10px' }}>
                  <Input label="Đáp án đúng (tham khảo)" value={q.correctText || ''} onChange={e => updateQuestion(q.id, 'correctText', e.target.value)} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* THANH CÔNG CỤ THÊM CÂU HỎI */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', justifyContent: 'center' }}>
        <Button style={{ backgroundColor: '#f1f5f9', color: '#003366', fontWeight: '700', border: '1px solid #cbd5e1' }} onClick={() => addQuestion('MCQ')}>+ Trắc nghiệm</Button>
        <Button style={{ backgroundColor: '#f1f5f9', color: '#003366', fontWeight: '700', border: '1px solid #cbd5e1' }} onClick={() => addQuestion('TF')}>+ Đúng / Sai</Button>
        <Button style={{ backgroundColor: '#f1f5f9', color: '#003366', fontWeight: '700', border: '1px solid #cbd5e1' }} onClick={() => addQuestion('SA')}>+ Trả lời ngắn</Button>
      </div>

    </div>
  );
}