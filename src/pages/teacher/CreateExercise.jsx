// src/pages/teacher/CreateExercise.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

// Danh sách các dạng câu hỏi IELTS
const QUESTION_TYPES = {
  MCQ: 'Multiple Choice',
  TFNG: 'True / False / Not Given',
  YNNG: 'Yes / No / Not Given',
  MH: 'Matching Headings',
  MI: 'Matching Information',
  MF: 'Matching Features',
  MSE: 'Matching Sentence Endings',
  SC: 'Sentence Completion',
  SUMC: 'Summary Completion',
  NC: 'Note Completion',
  TC: 'Table Completion',
  FC: 'Flow-chart Completion',
  DLC: 'Diagram Label Completion',
  SAQ: 'Short Answer Questions'
};

export default function CreateExercise() {
  const navigate = useNavigate();
  const { quizId } = useParams(); // Nếu có ID => Chế độ Edit
  const fileInputRef = useRef(null); // Ref để điều khiển input file ẩn
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State cho thanh công cụ chọn dạng câu hỏi
  const [selectedQuestionType, setSelectedQuestionType] = useState('MCQ');

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

  // HÀM XỬ LÝ IMPORT JSON
  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Cập nhật tên bài tập nếu có
        if (data.title) setQuizTitle(data.title);
        
        // Cập nhật danh sách câu hỏi
        if (data.questions && Array.isArray(data.questions)) {
          // Gán lại ID mới dựa trên timestamp để tránh trùng lặp key React
          const importedQuestions = data.questions.map((q, index) => ({
            ...q,
            id: (Date.now() + index).toString() 
          }));
          setQuestions(importedQuestions);
          alert(`Đã import thành công ${importedQuestions.length} câu hỏi!`);
        } else {
          alert("File JSON không chứa danh sách câu hỏi hợp lệ.");
        }
      } catch (error) {
        console.error("Lỗi parse JSON:", error);
        alert("File JSON không đúng định dạng. Vui lòng kiểm tra lại!");
      }
      // Reset input để có thể chọn lại cùng 1 file nếu cần
      event.target.value = null;
    };
    reader.readAsText(file);
  };

  // KHỞI TẠO STATE RIÊNG BIỆT CHO TỪNG DẠNG BÀI
  const addQuestion = () => {
    const type = selectedQuestionType;
    const newQ = { id: Date.now().toString(), type, points: 1 };
    
    switch (type) {
      case 'MCQ':
        newQ.text = '';
        newQ.options = ['', '', '', ''];
        newQ.correctOptions = []; 
        break;
      case 'TFNG':
        newQ.text = '';
        newQ.correctOption = 'True';
        break;
      case 'YNNG':
        newQ.text = '';
        newQ.correctOption = 'Yes';
        break;
      case 'MH':
      case 'MI':
      case 'MF':
      case 'MSE':
        newQ.text = ''; 
        newQ.correctMatch = ''; 
        break;
      case 'SC':
      case 'SUMC':
      case 'NC':
      case 'TC':
      case 'FC':
      case 'DLC':
      case 'SAQ':
        newQ.text = ''; 
        newQ.correctText = ''; 
        newQ.wordLimit = 3; 
        break;
      default:
        newQ.text = '';
    }
    
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
        folderId: null 
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
      
      {/* Input File ẩn để xử lý Import */}
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        onChange={handleImportJSON} 
        style={{ display: 'none' }} 
      />

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
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* NÚT IMPORT JSON MỚI */}
          <Button 
            onClick={() => fileInputRef.current.click()} 
            style={{ backgroundColor: '#f1f5f9', color: '#003366', fontWeight: '700', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '8px' }}
          >
            Import JSON
          </Button>

          <Button onClick={handleSave} disabled={isLoading} style={{ backgroundColor: '#003366', color: 'white', fontWeight: '700', padding: '12px 30px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
            {isLoading ? 'Đang lưu...' : 'Lưu và Hoàn tất'}
          </Button>
        </div>
      </div>

      {/* INPUT TITLE */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '10px', fontSize: '15px' }}>Tên bài tập</label>
        <input 
          type="text" 
          placeholder="Nhập tên bài tập... (VD: IELTS Reading Practice Test 1)" 
          value={quizTitle} 
          onChange={e => setQuizTitle(e.target.value)} 
          style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '16px', fontWeight: '500' }}
        />
      </div>

      {/* LIST CÂU HỎI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, index) => (
          <div key={q.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: '800', color: '#003366', fontSize: '16px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                Câu {index + 1} - {QUESTION_TYPES[q.type]}
              </span>
              <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                ✖ Xóa câu này
              </button>
            </div>

            {/* 1. MULTIPLE CHOICE */}
            {q.type === 'MCQ' && (
              <div>
                <Input label="Nội dung câu hỏi trắc nghiệm" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} />
                <label style={{ fontWeight: '700', color: '#003366', fontSize: '14px', display: 'block', margin: '20px 0 10px 0' }}>
                  Các lựa chọn (Tick để chọn đáp án đúng):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input 
                        type="checkbox" 
                        style={{ marginTop: '14px', width: '18px', height: '18px', cursor: 'pointer' }}
                        checked={q.correctOptions?.includes(i)}
                        onChange={e => {
                          let newCorrect = q.correctOptions ? [...q.correctOptions] : [];
                          if (e.target.checked) newCorrect.push(i);
                          else newCorrect = newCorrect.filter(idx => idx !== i);
                          updateQuestion(q.id, 'correctOptions', newCorrect);
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Input label={`Lựa chọn ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => {
                          const newOpts = [...q.options];
                          newOpts[i] = e.target.value;
                          updateQuestion(q.id, 'options', newOpts);
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. TRUE / FALSE / NOT GIVEN */}
            {q.type === 'TFNG' && (
              <div>
                <Input label="Nhận định (Statement)" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} />
                <div style={{ marginTop: '15px' }}>
                  <label style={{ fontWeight: '700', color: '#003366', fontSize: '14px' }}>Đáp án đúng: </label>
                  <select 
                    value={q.correctOption || 'True'} 
                    onChange={e => updateQuestion(q.id, 'correctOption', e.target.value)} 
                    style={{ padding: '10px 16px', marginLeft: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155' }}
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                    <option value="Not Given">Not Given</option>
                  </select>
                </div>
              </div>
            )}

            {/* 3. YES / NO / NOT GIVEN */}
            {q.type === 'YNNG' && (
              <div>
                <Input label="Quan điểm tác giả (Statement / Claim)" value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} />
                <div style={{ marginTop: '15px' }}>
                  <label style={{ fontWeight: '700', color: '#003366', fontSize: '14px' }}>Đáp án đúng: </label>
                  <select 
                    value={q.correctOption || 'Yes'} 
                    onChange={e => updateQuestion(q.id, 'correctOption', e.target.value)} 
                    style={{ padding: '10px 16px', marginLeft: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not Given">Not Given</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. MATCHING */}
            {['MH', 'MI', 'MF', 'MSE'].includes(q.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Input 
                  label={
                    q.type === 'MH' ? "Đoạn văn (VD: Paragraph A)" :
                    q.type === 'MI' ? "Thông tin cần tìm (Information)" :
                    q.type === 'MF' ? "Đặc điểm / Quan điểm (Feature)" :
                    "Phần đầu của câu (First part)"
                  } 
                  value={q.text} 
                  onChange={e => updateQuestion(q.id, 'text', e.target.value)} 
                />
                <Input 
                  label="Đáp án nối tương ứng (VD: Heading i, Paragraph A, Ending B...)" 
                  value={q.correctMatch || ''} 
                  onChange={e => updateQuestion(q.id, 'correctMatch', e.target.value)} 
                />
              </div>
            )}

            {/* 5. COMPLETION & SAQ */}
            {['SC', 'SUMC', 'NC', 'TC', 'FC', 'DLC', 'SAQ'].includes(q.type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <Input 
                  label={q.type === 'SAQ' ? "Câu hỏi ngắn" : "Nội dung (Dùng '___' cho chỗ trống)"} 
                  value={q.text} 
                  onChange={e => updateQuestion(q.id, 'text', e.target.value)} 
                />
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <Input label="Đáp án đúng" value={q.correctText || ''} onChange={e => updateQuestion(q.id, 'correctText', e.target.value)} />
                  </div>
                  <div style={{ width: '150px' }}>
                    <Input label="Giới hạn từ" type="number" value={q.wordLimit || 3} onChange={e => updateQuestion(q.id, 'wordLimit', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>

      {/* TOOLBAR THÊM CÂU HỎI */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', justifyContent: 'center', alignItems: 'center' }}>
        <label style={{ fontWeight: '700', color: '#003366', fontSize: '15px' }}>Chọn dạng bài:</label>
        <select 
          value={selectedQuestionType} 
          onChange={e => setSelectedQuestionType(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155', minWidth: '280px' }}
        >
          {Object.entries(QUESTION_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Button style={{ backgroundColor: '#f1f5f9', color: '#003366', fontWeight: '800', border: '1px solid #cbd5e1', padding: '10px 24px' }} onClick={addQuestion}>
          + Thêm câu hỏi
        </Button>
      </div>

    </div>
  );
}