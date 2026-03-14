// src/pages/teacher/CreateExercise.jsx
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Button from '../../components/Button';
import Input from '../../components/Input';

// --- HỆ THỐNG SVG ICONS ---
const SvgIcons = {
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>,
  Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  Drag: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Eye: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Copy: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  ChevronDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronUp: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>,
  Chart: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Archive: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>,
  Back: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
};

const QUESTION_TYPES = {
  MCQ: 'Multiple Choice', TFNG: 'True / False / Not Given', YNNG: 'Yes / No / Not Given',
  MH: 'Matching Headings', MI: 'Matching Information', MF: 'Matching Features', MSE: 'Matching Sentence Endings',
  SC: 'Sentence Completion', SUMC: 'Summary Completion', NC: 'Note Completion', TC: 'Table Completion',
  FC: 'Flow-chart Completion', DLC: 'Diagram Label Completion', SAQ: 'Short Answer Questions'
};

// ==========================================
// COMPONENT CON: QUESTION ITEM (TỐI ƯU RENDER)
// ==========================================
const QuestionItem = memo(({ q, index, updateQuestion, removeQuestion, duplicateQuestion }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handlePromptChange = (val) => {
    if (['SC', 'SUMC', 'NC', 'TC', 'FC', 'SAQ'].includes(q.type)) {
      const blanksCount = (val.match(/___/g) || []).length;
      let newAns = Array.isArray(q.correctAnswers) ? [...q.correctAnswers] : [];
      
      if (newAns.length < blanksCount) {
        newAns = [...newAns, ...Array(blanksCount - newAns.length).fill('')];
      } else if (newAns.length > blanksCount && blanksCount > 0) {
        newAns = newAns.slice(0, blanksCount);
      } else if (blanksCount === 0 && q.type !== 'SAQ') {
        newAns = [];
      }
      updateQuestion(q.id, { prompt: val, correctAnswers: newAns });
    } else {
      updateQuestion(q.id, { prompt: val });
    }
  };

  const handleImageClick = (e) => {
    if (q.type !== 'DLC' || !q.imageUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
    const newLabels = Array.isArray(q.labels) ? [...q.labels] : [];
    newLabels.push({ x: parseFloat(x), y: parseFloat(y), answer: '' });
    updateQuestion(q.id, { labels: newLabels });
  };

  return (
    <Draggable draggableId={String(q.id)} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef} {...provided.draggableProps} 
          style={{ 
            backgroundColor: 'white', padding: '24px', borderRadius: '16px', 
            border: '1px solid #e2e8f0', marginBottom: '20px',
            boxShadow: snapshot.isDragging ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
            ...provided.draggableProps.style 
          }}
        >
          {/* HEADER CÂU HỎI */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isCollapsed ? 'none' : '1px dashed #e2e8f0', paddingBottom: isCollapsed ? '0' : '16px', marginBottom: isCollapsed ? '0' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div {...provided.dragHandleProps} style={{ color: '#94a3b8', cursor: 'grab', display: 'flex' }}><SvgIcons.Drag /></div>
              <span style={{ fontWeight: '800', color: '#003366' }}>Câu {index + 1} | {QUESTION_TYPES[q.type] || 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAnalytics(!showAnalytics)} title="Analytics" style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SvgIcons.Chart /></button>
              <button onClick={() => duplicateQuestion(q.id)} title="Duplicate" style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SvgIcons.Copy /></button>
              <button onClick={() => setIsCollapsed(!isCollapsed)} title="Collapse" style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>{isCollapsed ? <SvgIcons.ChevronDown /> : <SvgIcons.ChevronUp />}</button>
              <button onClick={() => removeQuestion(q.id)} title="Delete" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><SvgIcons.Trash /></button>
            </div>
          </div>

          {/* MOCK ANALYTICS */}
          {showAnalytics && !isCollapsed && (
            <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#0369a1', border: '1px solid #bae6fd' }}>
              <strong>📊 Question Analytics (Mock):</strong> Tỷ lệ trả lời đúng: 68% | Độ khó: Trung bình | Đáp án phổ biến sai: B (15%).
            </div>
          )}

          {/* BODY CÂU HỎI */}
          {!isCollapsed && (
            <div>
              {/* 1. MCQ */}
              {q.type === 'MCQ' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input label="Question Prompt" value={q.prompt || ''} onChange={e => handlePromptChange(e.target.value)} />
                  {(Array.isArray(q.options) ? q.options : []).map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="checkbox" checked={(Array.isArray(q.correctOptions) ? q.correctOptions : []).includes(i)} onChange={e => {
                        let copy = Array.isArray(q.correctOptions) ? [...q.correctOptions] : [];
                        if (e.target.checked) copy.push(i); else copy = copy.filter(x => x !== i);
                        updateQuestion(q.id, { correctOptions: copy });
                      }} />
                      <Input value={opt} onChange={e => {
                        let opts = Array.isArray(q.options) ? [...q.options] : []; opts[i] = e.target.value; updateQuestion(q.id, { options: opts });
                      }} placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`} />
                      <button onClick={() => {
                        const newOpts = (Array.isArray(q.options) ? q.options : []).filter((_, idx) => idx !== i);
                        let newCorrect = (Array.isArray(q.correctOptions) ? q.correctOptions : []).filter(idx => idx !== i).map(idx => idx > i ? idx - 1 : idx);
                        updateQuestion(q.id, { options: newOpts, correctOptions: newCorrect });
                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><SvgIcons.Trash /></button>
                    </div>
                  ))}
                  <button onClick={() => updateQuestion(q.id, { options: [...(Array.isArray(q.options) ? q.options : []), ''] })} style={{ alignSelf: 'flex-start', background: 'none', color: '#003366', border: '1px dashed #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>+ Add Option</button>
                </div>
              )}

              {/* 2. MATCHING */}
              {['MH', 'MI', 'MF', 'MSE'].includes(q.type) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#003366' }}>Danh sách nguồn (List Items):</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {(Array.isArray(q.sourceList) ? q.sourceList : []).map((src, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', width: '25px' }}>{sIdx + 1}.</span>
                        <Input value={src} onChange={e => {
                          let newList = [...q.sourceList]; newList[sIdx] = e.target.value; updateQuestion(q.id, { sourceList: newList });
                        }} placeholder="Nhập lựa chọn..." />
                        <button onClick={() => updateQuestion(q.id, { sourceList: q.sourceList.filter((_, i) => i !== sIdx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><SvgIcons.Trash /></button>
                      </div>
                    ))}
                    <button onClick={() => updateQuestion(q.id, { sourceList: [...(Array.isArray(q.sourceList) ? q.sourceList : []), ''] })} style={{ alignSelf: 'flex-start', background: 'none', color: '#003366', border: '1px dashed #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>+ Thêm Item</button>
                  </div>

                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#003366' }}>Thiết lập cặp ghép (Pairs Mapping):</label>
                  {(Array.isArray(q.pairs) ? q.pairs : []).map((pair, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}><Input value={pair.statement || ''} onChange={e => {
                        let newPairs = [...q.pairs]; newPairs[pIdx].statement = e.target.value; updateQuestion(q.id, { pairs: newPairs });
                      }} placeholder="Câu hỏi / Đoạn văn" /></div>
                      <div style={{ flex: 1 }}><Input value={pair.match || ''} onChange={e => {
                        let newPairs = [...q.pairs]; newPairs[pIdx].match = e.target.value; updateQuestion(q.id, { pairs: newPairs });
                      }} placeholder="Đáp án đúng (VD: 1, 2, A, B...)" /></div>
                      <button onClick={() => updateQuestion(q.id, { pairs: q.pairs.filter((_, i) => i !== pIdx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><SvgIcons.Trash /></button>
                    </div>
                  ))}
                  <button onClick={() => updateQuestion(q.id, { pairs: [...(Array.isArray(q.pairs) ? q.pairs : []), { statement: '', match: '' }] })} style={{ alignSelf: 'flex-start', background: 'none', color: '#003366', border: '1px dashed #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>+ Thêm cặp</button>
                </div>
              )}

              {/* 3. MULTIPLE BLANKS */}
              {['SC', 'SUMC', 'NC', 'TC', 'FC', 'SAQ'].includes(q.type) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input label="Nội dung (Tự động tạo ô nhập khi bạn gõ '___')" value={q.prompt || ''} onChange={e => handlePromptChange(e.target.value)} />
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#003366' }}>Danh sách đáp án đúng:</label>
                  {(!q.correctAnswers || q.correctAnswers.length === 0) && <span style={{ fontSize: '13px', color: '#64748b' }}>Gõ '___' vào nội dung trên để tạo ô điền đáp án.</span>}
                  
                  {(Array.isArray(q.correctAnswers) ? q.correctAnswers : []).map((ans, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '65px' }}>Blank {aIdx + 1}:</span>
                      <Input value={ans} onChange={e => {
                        let newAns = [...q.correctAnswers]; newAns[aIdx] = e.target.value; updateQuestion(q.id, { correctAnswers: newAns });
                      }} placeholder="Nhập đáp án..." />
                    </div>
                  ))}
                  <div style={{ width: '200px' }}>
                    <Input label="Word Limit" type="number" min="1" value={q.wordLimit || 3} onChange={e => updateQuestion(q.id, { wordLimit: parseInt(e.target.value) || 3 })} />
                  </div>
                </div>
              )}

              {/* 4. DIAGRAM LABEL COMPLETION */}
              {q.type === 'DLC' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input label="Image URL (Đường dẫn ảnh sơ đồ)" value={q.imageUrl || ''} onChange={e => updateQuestion(q.id, { imageUrl: e.target.value })} placeholder="Nhập link ảnh rồi click trực tiếp lên ảnh để ghim nhãn..." />
                  
                  {q.imageUrl && (
                    <div>
                      <label style={{ fontWeight: '700', fontSize: '13px', color: '#ef4444', display: 'block', marginBottom: '8px' }}>* Click trực tiếp lên ảnh dưới đây để ghim Nhãn (Label):</label>
                      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', cursor: 'crosshair', borderRadius: '8px', border: '2px dashed #cbd5e1', overflow: 'hidden' }} onClick={handleImageClick}>
                        <img src={q.imageUrl} alt="Sơ đồ" style={{ maxWidth: '100%', display: 'block', pointerEvents: 'none' }} />
                        {(Array.isArray(q.labels) ? q.labels : []).map((lbl, lIdx) => (
                          <div key={lIdx} style={{ position: 'absolute', left: `${lbl.x}%`, top: `${lbl.y}%`, transform: 'translate(-50%, -50%)', background: '#003366', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid white', pointerEvents: 'none' }}>
                            {lIdx + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(Array.isArray(q.labels) ? q.labels : []).map((lbl, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#003366', minWidth: '65px' }}>Nhãn {lIdx + 1}:</span>
                      <div style={{ display: 'flex', gap: '6px', width: '140px' }}>
                        <input type="number" step="0.1" value={lbl.x} onChange={e => { let newLbls = [...q.labels]; newLbls[lIdx].x = parseFloat(e.target.value); updateQuestion(q.id, { labels: newLbls }); }} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }} title="Tọa độ X (%)" />
                        <input type="number" step="0.1" value={lbl.y} onChange={e => { let newLbls = [...q.labels]; newLbls[lIdx].y = parseFloat(e.target.value); updateQuestion(q.id, { labels: newLbls }); }} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }} title="Tọa độ Y (%)" />
                      </div>
                      <div style={{ flex: 1 }}><Input value={lbl.answer || ''} onChange={e => { let newLbls = [...q.labels]; newLbls[lIdx].answer = e.target.value; updateQuestion(q.id, { labels: newLbls }); }} placeholder="Nhập đáp án đúng..." /></div>
                      <button onClick={() => updateQuestion(q.id, { labels: q.labels.filter((_, i) => i !== lIdx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><SvgIcons.Trash /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. TFNG & YNNG */}
              {['TFNG', 'YNNG'].includes(q.type) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input label="Question Prompt" value={q.prompt || ''} onChange={e => handlePromptChange(e.target.value)} />
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {(q.type === 'TFNG' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given']).map(opt => (
                      <label key={opt} style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={q.correctOption === opt} onChange={e => updateQuestion(q.id, { correctOption: e.target.value })} value={opt} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
});

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function CreateExercise() {
  const navigate = useNavigate();
  const { quizId } = useParams(); 
  const fileInputRef = useRef(null); 
  
  const [isMounted, setIsMounted] = useState(false); // FLAG CHỐNG LỖI REACT 18 DND
  const [quizTitle, setQuizTitle] = useState('');
  const [quizPassage, setQuizPassage] = useState(''); 
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('MCQ');
  
  const [draftStatus, setDraftStatus] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);

  // KÍCH HOẠT COMPONENT CHỈ SAU KHI MOUNT THÀNH CÔNG
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // AUTOSAVE & DRAFT STATUS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quizTitle || questions.length > 0) {
        setDraftStatus('Saving...');
        localStorage.setItem(`draft_quiz_${quizId || 'new'}`, JSON.stringify({ quizTitle, quizPassage, questions }));
        setTimeout(() => setDraftStatus(`Draft Saved at ${new Date().toLocaleTimeString()}`), 500);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [quizTitle, quizPassage, questions, quizId]);

  // LOAD DỮ LIỆU CÓ TRY/CATCH ĐỂ LOẠI BỎ DRAFT LỖI
  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      try {
        if (quizId) {
          const docSnap = await getDoc(doc(db, "quizzes", quizId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setQuizTitle(data.title || ''); 
            setQuizPassage(data.passage || ''); 
            setQuestions(Array.isArray(data.questions) ? data.questions : []);
          }
        } else {
          const draft = localStorage.getItem('draft_quiz_new');
          if (draft) {
            try {
              const parsed = JSON.parse(draft);
              setQuizTitle(parsed.quizTitle || ''); 
              setQuizPassage(parsed.quizPassage || ''); 
              setQuestions(Array.isArray(parsed.questions) ? parsed.questions : []);
            } catch (parseError) {
              console.warn("Draft bị lỗi cấu trúc, hệ thống đang làm sạch...");
              localStorage.removeItem('draft_quiz_new');
              setQuestions([]);
            }
          }
        }
      } catch (error) { 
        console.error("Lỗi khi tải dữ liệu:", error); 
        setQuestions([]); 
      }
      setIsLoading(false);
    };
    fetchQuizData();
  }, [quizId]);

  // SCHEMA VALIDATION KHI IMPORT
  const validateSchema = (data) => {
    if (!data.title || typeof data.title !== 'string') throw new Error("Thiếu hoặc sai kiểu dữ liệu 'title'");
    if (!Array.isArray(data.questions)) throw new Error("'questions' phải là một mảng");
    data.questions.forEach((q, i) => {
      if (!q.type || !QUESTION_TYPES[q.type]) throw new Error(`Câu ${i+1}: Loại câu hỏi không hợp lệ`);
    });
    return true;
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        validateSchema(data);
        setQuizTitle(data.title); setQuizPassage(data.passage || '');
        setQuestions(data.questions.map((q, i) => ({ ...q, id: String(Date.now() + i) })));
      } catch (err) { alert(`File JSON không hợp lệ: ${err.message}`); }
      event.target.value = null;
    };
    reader.readAsText(file);
  };

  // CÁC HÀM CẬP NHẬT STATE THEO FUNCTIONAL STATE + USECALLBACK
  const addQuestion = () => {
    const type = selectedQuestionType;
    const base = { id: String(Date.now()), type, prompt: '', points: 1 };
    let spec = {};
    if (type === 'MCQ') spec = { options: ['', '', '', ''], correctOptions: [] };
    else if (['TFNG', 'YNNG'].includes(type)) spec = { correctOption: type === 'TFNG' ? 'True' : 'Yes' };
    else if (['MH', 'MI', 'MF', 'MSE'].includes(type)) spec = { sourceList: [''], pairs: [{ statement: '', match: '' }] };
    else if (['SC', 'SUMC', 'NC', 'TC', 'FC', 'SAQ'].includes(type)) spec = { correctAnswers: [], wordLimit: 3 };
    else if (type === 'DLC') spec = { imageUrl: '', labels: [] };
    setQuestions(prev => [...prev, { ...base, ...spec }]);
  };

  const updateQuestion = useCallback((id, updates) => {
    setQuestions(prev => prev.map(q => String(q.id) === String(id) ? { ...q, ...updates } : q));
  }, []);

  const removeQuestion = useCallback((id) => {
    setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
  }, []);

  const duplicateQuestion = useCallback((id) => {
    setQuestions(prev => {
      const qIndex = prev.findIndex(q => String(q.id) === String(id));
      if (qIndex === -1) return prev;
      const copy = JSON.parse(JSON.stringify(prev[qIndex])); 
      copy.id = String(Date.now()); 
      const newQ = [...prev];
      newQ.splice(qIndex + 1, 0, copy);
      return newQ;
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setQuestions(prev => {
      const reordered = Array.from(prev);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      return reordered;
    });
  };

  // KIỂM TRA HỢP LỆ TRƯỚC KHI LƯU
  const validateBeforeSave = () => {
    if (!quizTitle.trim()) return "Quiz Title không được để trống!";
    if (questions.length === 0) return "Cần ít nhất 1 câu hỏi!";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === 'MCQ' && (!q.correctOptions || q.correctOptions.length === 0)) return `Câu ${i + 1} (MCQ) phải có ít nhất 1 đáp án đúng!`;
      if (['SC', 'SUMC', 'NC', 'TC', 'FC'].includes(q.type)) {
        const blanksCount = ((q.prompt || '').match(/___/g) || []).length;
        if (blanksCount === 0 || !q.correctAnswers || q.correctAnswers.length !== blanksCount) return `Câu ${i + 1} (Completion) số lượng đáp án không khớp với số blanks (___)!`;
      }
      if (q.type === 'DLC' && (!q.imageUrl || !q.labels || q.labels.length === 0)) return `Câu ${i + 1} (DLC) phải có hình ảnh và ít nhất 1 nhãn (Label)!`;
    }
    return null;
  };

  const handleSave = async () => {
    const errorMsg = validateBeforeSave();
    if (errorMsg) return alert(errorMsg);

    setIsLoading(true);
    try {
      await setDoc(doc(db, "quizzes", quizId || 'q_' + Date.now()), {
        title: quizTitle, passage: quizPassage, questions, modified: new Date().toISOString()
      }, { merge: true });
      localStorage.removeItem(`draft_quiz_${quizId || 'new'}`);
      alert("Đã lưu bài tập thành công!");
      navigate('/teacher/exercises');
    } catch (error) { alert("Lỗi lưu bài tập!"); }
    setIsLoading(false);
  };

  const addFromBank = () => {
    const mockQ = { id: String(Date.now()), type: 'MCQ', prompt: 'Mock question from Bank?', options: ['A', 'B'], correctOptions: [0] };
    setQuestions(prev => [...prev, mockQ]);
    setShowBankModal(false);
    alert("Đã thêm câu hỏi mẫu từ thư viện!");
  };

  // ==========================================
  // GIAO DIỆN PREVIEW
  // ==========================================
  const renderStudentView = (q) => {
    switch (q.type) {
      case 'MCQ':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {(Array.isArray(q.options) ? q.options : []).map((opt, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type={(Array.isArray(q.correctOptions) ? q.correctOptions : []).length > 1 ? "checkbox" : "radio"} name={`prev_${q.id}`} /> {opt}
              </label>
            ))}
          </div>
        );
      case 'TFNG': case 'YNNG':
        return (
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {(q.type === 'TFNG' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given']).map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name={`prev_${q.id}`} /> {opt}
              </label>
            ))}
          </div>
        );
      case 'MH': case 'MI': case 'MF': case 'MSE':
        return (
          <div style={{ marginTop: '16px' }}>
            <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '16px', fontSize: '15px', border: '1px solid #cbd5e1' }}>
              <strong>Danh sách lựa chọn (Options):</strong>
              <ol style={{ paddingLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
                {(Array.isArray(q.sourceList) ? q.sourceList : []).map((src, i) => <li key={i} style={{ marginBottom: '4px' }}>{src}</li>)}
              </ol>
            </div>
            {(Array.isArray(q.pairs) ? q.pairs : []).map((pair, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', minWidth: '80px' }}>Câu {pIdx + 1}:</span>
                <span style={{ flex: 1 }}>{pair.statement || '...'}</span>
                <input type="text" placeholder="Nhập đáp án..." style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '120px' }} />
              </div>
            ))}
          </div>
        );
      case 'DLC':
        return (
          <div style={{ marginTop: '16px' }}>
            {q.imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                <img src={q.imageUrl} alt="Diagram" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'block' }} />
                {(Array.isArray(q.labels) ? q.labels : []).map((lbl, lIdx) => (
                  <div key={lIdx} style={{ position: 'absolute', left: `${lbl.x}%`, top: `${lbl.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#003366', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{lIdx + 1}</div>
                    <input type="text" placeholder="Nhãn..." style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      default: // SC, SUMC, NC, TC, FC, SAQ
        if (!q.prompt) return null;
        const parts = q.prompt.split('___');
        return (
          <div style={{ marginTop: '12px', lineHeight: '2.4', fontSize: '15px' }}>
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <input type="text" placeholder={`Blank ${i+1}`} style={{ 
                    width: '100px', margin: '0 8px', borderBottom: '2px solid #003366', 
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none', 
                    background: '#f1f5f9', outline: 'none', textAlign: 'center', fontWeight: '600' 
                  }} />
                )}
              </span>
            ))}
            {q.type === 'SAQ' && parts.length === 1 && (
              <div style={{ marginTop: '12px' }}><input type="text" placeholder="Nhập câu trả lời ngắn..." style={{ padding: '8px 12px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
            )}
          </div>
        );
    }
  };

  if (isPreview) {
    return (
      <div style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <button onClick={() => setIsPreview(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', padding: '10px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: '700' }}><SvgIcons.Back /> Quay lại trang chỉnh sửa</button>
        <div style={{ padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h1 style={{ color: '#003366', textAlign: 'center', marginBottom: '10px' }}>{quizTitle || 'Untitled Quiz'}</h1>
          <hr style={{ border: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '30px' }} />
          {quizPassage && <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '40px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>{quizPassage}</div>}
          {questions.map((q, i) => (
            <div key={q.id} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: i < questions.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#334155' }}>
                <strong style={{ color: '#003366', fontSize: '18px' }}>Câu {i + 1}:</strong> {['MH', 'MI', 'MF', 'MSE', 'DLC'].includes(q.type) ? '' : (q.prompt || '')}
              </div>
              {renderStudentView(q)}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Button style={{ backgroundColor: '#003366', color: 'white', padding: '12px 32px', fontSize: '16px' }}>Nộp bài (Submit Test)</Button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu giao diện chưa mount xong, hiển thị một loading nhẹ để tránh lỗi DND
  if (!isMounted) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải công cụ soạn bài...</div>;

  // ==========================================
  // GIAO DIỆN TEACHER
  // ==========================================
  return (
    <div style={{ paddingBottom: '120px', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} style={{ display: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <button onClick={() => navigate('/teacher/exercises')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '700' }}><SvgIcons.Back /> Back to Library</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ color: '#003366', margin: 0, fontSize: '28px' }}>{quizId ? 'Edit Quiz' : 'Add Quiz'}</h2>
              {draftStatus && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', backgroundColor: '#d1fae5', padding: '4px 8px', borderRadius: '100px' }}>{draftStatus}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => setShowBankModal(true)} style={{ backgroundColor: '#fff', color: '#003366', border: '1px solid #cbd5e1' }}><SvgIcons.Archive /> Question Bank</Button>
            <Button onClick={() => setIsPreview(true)} style={{ backgroundColor: '#f1f5f9', color: '#003366' }}><SvgIcons.Eye /> Preview</Button>
            <Button onClick={() => fileInputRef.current.click()} style={{ backgroundColor: 'white', color: '#003366', border: '1px solid #cbd5e1' }}>Import JSON</Button>
            <Button onClick={handleSave} disabled={isLoading} style={{ backgroundColor: '#003366', color: 'white' }}>{isLoading ? 'Saving...' : 'Save Quiz'}</Button>
          </div>
        </div>

        {showBankModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px' }}>
              <h3 style={{ marginTop: 0 }}>Thư viện câu hỏi (Question Bank)</h3>
              <p style={{ color: '#64748b' }}>Tính năng đang phát triển. Bấm nút dưới để thêm câu hỏi mẫu.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button onClick={addFromBank} style={{ background: '#003366', color: 'white' }}>Thêm câu mẫu</Button>
                <Button onClick={() => setShowBankModal(false)} style={{ background: '#e2e8f0', color: 'black' }}>Đóng</Button>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <Input label="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Nhập tên bài quiz..." />
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: '700', color: '#003366', marginBottom: '12px', display: 'block' }}>Reading Passage</label>
            <textarea value={quizPassage} onChange={e => setQuizPassage(e.target.value)} placeholder="Nhập bài đọc ở đây..." style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '150px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="question-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column' }}>
                {questions.map((q, index) => (
                  <QuestionItem 
                    key={q.id} q={q} index={index} 
                    updateQuestion={updateQuestion} 
                    removeQuestion={removeQuestion} 
                    duplicateQuestion={duplicateQuestion}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '12px 20px', borderRadius: '100px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <select value={selectedQuestionType} onChange={e => setSelectedQuestionType(e.target.value)} style={{ padding: '10px 16px', borderRadius: '100px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc' }}>
          {Object.entries(QUESTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold' }}><SvgIcons.Plus /> Add Question</button>
      </div>
    </div>
  );
}