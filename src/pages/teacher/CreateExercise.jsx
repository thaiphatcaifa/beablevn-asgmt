import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function CreateExercise() {
  const navigate = useNavigate();
  const { quizId } = useParams(); // Lấy ID từ URL (nếu ở chế độ chỉnh sửa)
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Nếu có quizId, tải dữ liệu bài tập cũ lên
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
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
        setIsLoading(false);
      };
      fetchQuizData();
    }
  }, [quizId, navigate]);

  const addQuestion = (type) => {
    const newQ = { id: Date.now(), type, text: '' };
    if (type === 'MCQ') newQ.options = ['', '', '', ''];
    if (type === 'TF') newQ.correctOption = 'True';
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) { alert("Vui lòng nhập tên bài tập!"); return; }
    
    setIsLoading(true);
    try {
      if (quizId) {
        // Cập nhật bài đã có
        const docRef = doc(db, "quizzes", quizId);
        await updateDoc(docRef, {
          title: quizTitle,
          questions: questions
        });
        alert("Đã cập nhật bài tập thành công!");
      } else {
        // Tạo bài mới
        const newDocRef = doc(collection(db, "quizzes"));
        await setDoc(newDocRef, {
          title: quizTitle,
          createdAt: new Date().toISOString(),
          questions: questions
        });
        alert("Đã lưu bài tập thành công!");
      }
      navigate('/teacher/exercises');
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi khi lưu bài tập.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang xử lý dữ liệu...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#003366', margin: 0 }}>{quizId ? 'Chỉnh sửa bài tập' : 'Quiz Builder'}</h2>
        <Button variant="danger" style={{ width: 'auto', padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/teacher/exercises')}>
          Hủy bỏ
        </Button>
      </div>

      <Input label="Tên bài tập" placeholder="VD: Kiểm tra cuối kỳ" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
      
      <div style={{ marginTop: '20px' }}>
        {questions.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có câu hỏi nào. Hãy bấm thêm câu hỏi bên dưới.</p>}
        {questions.map((q, index) => (
          <div key={q.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Câu {index + 1} {q.type ? `(${q.type})` : '(MCQ)'}</h4>
              <button onClick={() => setQuestions(questions.filter(x => x.id !== q.id))} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none', fontWeight: 'bold' }}>Xóa câu hỏi</button>
            </div>
            <Input placeholder="Nội dung câu hỏi..." value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} />
            
            {/* Hỗ trợ câu hỏi cũ chưa có trường 'type' hoặc type là MCQ */}
            {(!q.type || q.type === 'MCQ') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(q.options || ['', '', '', '']).map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`} 
                      checked={q.correctOption === opt && opt !== ''} 
                      onChange={() => updateQuestion(q.id, 'correctOption', opt)} 
                      title="Đánh dấu đáp án đúng"
                    />
                    <div style={{ flex: 1 }}>
                      <Input placeholder={`Lựa chọn ${i + 1}`} value={opt} onChange={e => {
                        const newOpts = [...(q.options || ['', '', '', ''])]; 
                        newOpts[i] = e.target.value; 
                        updateQuestion(q.id, 'options', newOpts);
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {q.type === 'TF' && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#003366' }}>Đáp án đúng: </label>
                <select value={q.correctOption || 'True'} onChange={e => updateQuestion(q.id, 'correctOption', e.target.value)} style={{ padding: '10px', marginLeft: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}

            {q.type === 'SA' && (
              <Input label="Đáp án đúng (tham khảo)" value={q.correctText || ''} onChange={e => updateQuestion(q.id, 'correctText', e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button variant="primary" style={{ width: 'auto' }} onClick={() => addQuestion('MCQ')}>+ Multiple Choice</Button>
        <Button variant="primary" style={{ width: 'auto' }} onClick={() => addQuestion('TF')}>+ True/False</Button>
        <Button variant="primary" style={{ width: 'auto' }} onClick={() => addQuestion('SA')}>+ Short Answer</Button>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="success" style={{ width: 'auto', padding: '15px 30px' }} onClick={handleSave}>
          {quizId ? '💾 Cập nhật Bài Tập' : '💾 Lưu Bài Tập'}
        </Button>
      </div>
    </div>
  );
}