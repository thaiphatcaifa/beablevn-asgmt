// src/pages/teacher/Launch.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import { TeacherContext } from './TeacherDashboard';

// --- COMPONENT: CÔNG TẮC (TOGGLE SWITCH) TỐI GIẢN ---
const Toggle = ({ label, checked, onChange, disabled, info }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: disabled ? '#94a3b8' : '#334155', fontSize: '15px', fontWeight: '500' }}>
      {label} 
      {info && <span style={{ color: '#0ea5e9', cursor: 'help', fontSize: '16px' }} title={info}>🛈</span>}
    </div>
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '46px', height: '26px', borderRadius: '13px',
        backgroundColor: checked ? '#003366' : '#cbd5e1',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease', opacity: disabled ? 0.6 : 1
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'white',
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  </div>
);

// --- COMPONENT: THẺ CHỌN PHƯƠNG THỨC ---
const MethodCard = ({ title, icon, description, active, onClick }) => (
  <div onClick={onClick} style={{
    border: active ? '2px solid #003366' : '1px solid #e2e8f0',
    borderRadius: '8px', padding: '20px', marginBottom: '15px', cursor: 'pointer',
    backgroundColor: active ? '#f8fafc' : 'white', transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: active ? '10px' : '0' }}>
      <div style={{ color: active ? '#003366' : '#94a3b8', fontSize: '24px', display: 'flex' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: '16px', fontWeight: active ? '700' : '500', color: active ? '#003366' : '#475569' }}>{title}</div>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        border: active ? '6px solid #003366' : '2px solid #cbd5e1',
        backgroundColor: 'white', transition: 'border 0.2s ease'
      }} />
    </div>
    {active && description && (
      <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '40px' }}>{description}</div>
    )}
  </div>
);

// --- TRANG CHÍNH: LAUNCH ---
export default function Launch() {
  const navigate = useNavigate();
  const { activeRoom } = useContext(TeacherContext);
  
  const [quizzes, setQuizzes] = useState([]);
  const [step, setStep] = useState('MENU'); // MENU -> SELECT_QUIZ -> CONFIG
  const [selectedQuizId, setSelectedQuizId] = useState('');

  // --- CÁC STATE CẤU HÌNH BÀI THI ---
  const [deliveryMethod, setDeliveryMethod] = useState('Instant Feedback');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [oneAttempt, setOneAttempt] = useState(true);

  // Lấy dữ liệu bài tập
  useEffect(() => {
    const fetchQuizzes = async () => {
      const qSnap = await getDocs(collection(db, "quizzes"));
      // Chỉ lấy các quiz chưa bị xóa
      setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(q => !q.isDeleted));
    };
    fetchQuizzes();
  }, []);

  const handleLaunchActivity = async () => {
    if (!activeRoom) {
      alert("Vui lòng chọn Lớp học (Room) ở góc phải màn hình trước khi Launch!"); return;
    }
    try {
      const roomSnap = await getDoc(doc(db, "rooms", activeRoom));
      if (roomSnap.data()?.activeSession) {
        if(!window.confirm(`Lớp ${activeRoom} đang có một hoạt động diễn ra. Bạn có chắc muốn dừng bài cũ và chạy bài mới này không?`)) return;
      }

      const quizData = quizzes.find(q => q.id === selectedQuizId);

      // Cập nhật session lên Firebase, chuyển tiếp sang Live Results
      await updateDoc(doc(db, "rooms", activeRoom), {
        activeSession: {
          quizId: selectedQuizId,
          quizTitle: quizData.title,
          mode: deliveryMethod,
          settings: { shuffleQuestions, shuffleAnswers, showFeedback, showFinalScore, oneAttempt },
          status: 'active',
          startTime: new Date().toISOString()
        }
      });
      navigate('/teacher/live');
    } catch (error) {
      console.error("Lỗi khởi chạy:", error);
      alert("Lỗi kết nối. Không thể khởi chạy bài tập.");
    }
  };

  const selectedQuizData = quizzes.find(q => q.id === selectedQuizId);

  const circleCardStyle = {
    width: '180px', height: '160px', borderRadius: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'white', color: '#003366', fontWeight: '700', fontSize: '18px', cursor: 'pointer',
    border: '2px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ padding: '20px', minHeight: '80vh', position: 'relative' }}>
      <h2 style={{ color: '#003366', fontWeight: '800', marginBottom: '40px', textAlign: 'center', fontSize: '28px' }}>Launch</h2>
      
      {/* 3 Nút chức năng chính */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '80px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setStep('SELECT_QUIZ')} 
          style={circleCardStyle} 
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#003366'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,51,102,0.15)'; }} 
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Bài kiểm tra
        </button>

        <button 
          style={circleCardStyle} 
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#003366'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,51,102,0.15)'; }} 
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
          Thi đua
        </button>

        <button 
          style={circleCardStyle} 
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#003366'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,51,102,0.15)'; }} 
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Ôn tập nhanh
        </button>
      </div>

      {/* --- OVERLAY MODALS --- */}
      {step !== 'MENU' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          
          {/* MODAL 1: CHỌN BÀI TẬP */}
          {step === 'SELECT_QUIZ' && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                <h2 style={{ color: '#003366', margin: 0, fontWeight: '800' }}>Chọn bài tập từ Thư viện</h2>
                <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#003366'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>✕</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quizzes.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Thư viện chưa có bài tập nào.</p> : quizzes.map(q => (
                  <div 
                    key={q.id} 
                    onClick={() => { setSelectedQuizId(q.id); setStep('CONFIG'); }}
                    style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{ fontWeight: '700', color: '#003366', fontSize: '16px' }}>{q.title}</div>
                    <div style={{ color: '#64748b', fontSize: '14px', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>{q.questions?.length || 0} câu hỏi</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODAL 2: CẤU HÌNH (CONFIG) */}
          {step === 'CONFIG' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
              
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button onClick={() => setStep('SELECT_QUIZ')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#003366', display: 'flex', alignItems: 'center', padding: '4px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <h2 style={{ color: '#003366', margin: 0, fontSize: '20px', fontWeight: '800', textTransform: 'uppercase' }}>{selectedQuizData?.title}</h2>
                </div>
                <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#003366'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* 2 Columns Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '30px' }}>
                
                {/* Cột trái: Delivery Method */}
                <div>
                  <h3 style={{ fontSize: '16px', color: '#64748b', marginTop: 0, marginBottom: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Method</h3>
                  
                  <MethodCard 
                    title="Instant Feedback" 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>} 
                    active={deliveryMethod === 'Instant Feedback'} 
                    onClick={() => { setDeliveryMethod('Instant Feedback'); setShuffleQuestions(false); setShuffleAnswers(false); setOneAttempt(true); }}
                    description="Học viên làm câu hỏi theo thứ tự và không thể đổi đáp án. Nhận phản hồi ngay."
                  />
                  <MethodCard 
                    title="Open Navigation" 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>} 
                    active={deliveryMethod === 'Open Navigation'} 
                    onClick={() => { setDeliveryMethod('Open Navigation'); setShowFeedback(false); setOneAttempt(false); }}
                    description="Học viên tự do chuyển giữa các câu hỏi và thay đổi đáp án trước khi nộp bài."
                  />
                  <MethodCard 
                    title="Teacher Paced" 
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} 
                    active={deliveryMethod === 'Teacher Paced'} 
                    onClick={() => setDeliveryMethod('Teacher Paced')}
                    description="Giáo viên điều khiển tiến trình làm bài, hiển thị từng câu hỏi một cho cả lớp."
                  />
                </div>

                {/* Cột phải: Settings */}
                <div>
                  <h3 style={{ fontSize: '16px', color: '#64748b', marginTop: 0, marginBottom: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Settings</h3>
                  
                  <Toggle label="Require Names" checked={true} disabled={true} />
                  <Toggle label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
                  <Toggle label="Shuffle Answers" checked={shuffleAnswers} onChange={setShuffleAnswers} />
                  <Toggle label="Show Question Feedback" checked={showFeedback} onChange={setShowFeedback} disabled={deliveryMethod === 'Open Navigation'} />
                  <Toggle label="Show Final Score" checked={showFinalScore} onChange={setShowFinalScore} />
                  <Toggle label="One Attempt" checked={oneAttempt} onChange={setOneAttempt} info="Học viên chỉ được gửi bài 1 lần duy nhất." />
                </div>
              </div>

              {/* Footer Modal */}
              <div style={{ padding: '24px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
                <Button onClick={handleLaunchActivity} style={{ backgroundColor: '#003366', color: 'white', padding: '14px 40px', fontSize: '16px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
                  Launch
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}