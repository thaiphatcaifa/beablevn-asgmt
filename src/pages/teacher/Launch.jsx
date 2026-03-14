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
        backgroundColor: checked ? '#10b981' : '#cbd5e1', // Màu xanh lá khi Bật giống ảnh
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

// --- COMPONENT: THẺ CHỌN PHƯƠNG THỨC (DELIVERY METHOD CARD) ---
const MethodCard = ({ title, icon, description, active, onClick }) => (
  <div onClick={onClick} style={{
    border: active ? '2px solid #003366' : '1px solid #e2e8f0',
    borderRadius: '8px', padding: '20px', marginBottom: '15px', cursor: 'pointer',
    backgroundColor: active ? '#f8fafc' : 'white', transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: active ? '10px' : '0' }}>
      <div style={{ color: active ? '#003366' : '#94a3b8', fontSize: '24px' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: '16px', fontWeight: active ? '700' : '500', color: active ? '#003366' : '#475569' }}>{title}</div>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        border: active ? '6px solid #003366' : '2px solid #cbd5e1',
        backgroundColor: 'white'
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
  const [step, setStep] = useState('MENU'); // Các bước: MENU -> SELECT_QUIZ -> CONFIG
  const [selectedQuizId, setSelectedQuizId] = useState('');

  // --- CÁC STATE CẤU HÌNH BÀI THI ---
  const [deliveryMethod, setDeliveryMethod] = useState('Instant Feedback');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [oneAttempt, setOneAttempt] = useState(true);

  // Fetch danh sách bài tập từ Firestore
  useEffect(() => {
    const fetchQuizzes = async () => {
      const qSnap = await getDocs(collection(db, "quizzes"));
      setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchQuizzes();
  }, []);

  // Xử lý gửi dữ liệu lên Firebase và chuyển sang Live Results
  const handleLaunchActivity = async () => {
    if (!activeRoom) {
      alert("Vui lòng chọn Lớp học ở góc phải màn hình trước khi Launch!"); return;
    }
    try {
      // Kiểm tra xem phòng có đang chạy bài nào không
      const roomSnap = await getDoc(doc(db, "rooms", activeRoom));
      if (roomSnap.data()?.activeSession) {
        if(!window.confirm(`Lớp ${activeRoom} đang có một hoạt động diễn ra. Bạn có muốn dừng hoạt động cũ và chạy bài mới này không?`)) return;
      }

      const quizData = quizzes.find(q => q.id === selectedQuizId);

      // Cập nhật trạng thái phòng kèm theo TẤT CẢ cài đặt giáo viên đã chọn
      await updateDoc(doc(db, "rooms", activeRoom), {
        activeSession: {
          quizId: selectedQuizId,
          quizTitle: quizData.title,
          mode: deliveryMethod,
          settings: {
            shuffleQuestions,
            shuffleAnswers,
            showFeedback,
            showFinalScore,
            oneAttempt
          },
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

  // --- RENDER BƯỚC 1: MENU CHÍNH ---
  if (step === 'MENU') {
    const circleCardStyle = {
      width: '160px', height: '160px', borderRadius: '50%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s', border: 'none',
      fontFamily: "'Josefin Sans', sans-serif"
    };

    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#003366', fontWeight: '800', marginBottom: '40px', textAlign: 'center', fontSize: '28px' }}>Launch</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginBottom: '80px' }}>
          <button onClick={() => setStep('SELECT_QUIZ')} style={{ ...circleCardStyle, backgroundColor: '#f59e0b' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '36px', marginBottom: '10px' }}>🚀</span> Quiz
          </button>
          <button style={{ ...circleCardStyle, backgroundColor: '#3b82f6' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '36px', marginBottom: '10px' }}>🛸</span> Space Race
          </button>
          <button style={{ ...circleCardStyle, backgroundColor: '#8b5cf6' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '36px', marginBottom: '10px' }}>🚪</span> Exit Ticket
          </button>
        </div>

        <h3 style={{ color: '#64748b', fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>Quick Question</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <button style={{ ...circleCardStyle, width: '100px', height: '100px', backgroundColor: '#10b981', fontSize: '18px' }}>MC</button>
          <button style={{ ...circleCardStyle, width: '100px', height: '100px', backgroundColor: '#14b8a6', fontSize: '18px' }}>TF</button>
          <button style={{ ...circleCardStyle, width: '100px', height: '100px', backgroundColor: '#0ea5e9', fontSize: '18px' }}>SA</button>
        </div>
      </div>
    );
  }

  // --- RENDER BƯỚC 2: CHỌN BÀI TẬP ---
  if (step === 'SELECT_QUIZ') {
    return (
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#003366', fontWeight: 'bold' }}>&lt;</button>
          <h2 style={{ color: '#003366', margin: 0, fontWeight: '800' }}>Chọn bài tập để phát</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quizzes.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Thư viện chưa có bài tập nào.</p> : quizzes.map(q => (
            <div 
              key={q.id} 
              onClick={() => { setSelectedQuizId(q.id); setStep('CONFIG'); }}
              style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '700', color: '#003366', fontSize: '16px' }}>{q.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>{q.questions?.length || 0} câu hỏi</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER BƯỚC 3: CẤU HÌNH (CONFIG - GIỐNG ẢNH YÊU CẦU) ---
  if (step === 'CONFIG') {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setStep('SELECT_QUIZ')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#003366', fontWeight: 'bold' }}>&lt;</button>
            <h2 style={{ color: '#003366', margin: 0, fontSize: '20px', fontWeight: '800', textTransform: 'uppercase' }}>{selectedQuizData?.title}</h2>
          </div>
          <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#94a3b8' }}>✕</button>
        </div>

        {/* 2 Columns Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '30px' }}>
          
          {/* Cột trái: Delivery Method */}
          <div>
            <h3 style={{ fontSize: '18px', color: '#334155', marginTop: 0, marginBottom: '20px', fontWeight: '700' }}>Delivery Method</h3>
            
            <MethodCard 
              title="Instant Feedback" 
              icon="🔣" 
              active={deliveryMethod === 'Instant Feedback'} 
              onClick={() => {
                setDeliveryMethod('Instant Feedback');
                setShuffleQuestions(false); setShuffleAnswers(false); setOneAttempt(true);
              }}
              description="Students answer questions in order and cannot change answers. Instant feedback is provided after each question. You monitor progress in a table of live results."
            />
            <MethodCard 
              title="Open Navigation" 
              icon="🧭" 
              active={deliveryMethod === 'Open Navigation'} 
              onClick={() => {
                setDeliveryMethod('Open Navigation');
                setShowFeedback(false); setOneAttempt(false);
              }}
              description="Students may answer questions in any order and change answers before finishing. You monitor progress in a table of live results."
            />
            <MethodCard 
              title="Teacher Paced" 
              icon="👨‍🏫" 
              active={deliveryMethod === 'Teacher Paced'} 
              onClick={() => setDeliveryMethod('Teacher Paced')}
              description="You control the flow of questions. You send one question at a time and visualize responses as they happen."
            />
          </div>

          {/* Cột phải: Settings */}
          <div>
            <h3 style={{ fontSize: '18px', color: '#334155', marginTop: 0, marginBottom: '20px', fontWeight: '700' }}>Settings</h3>
            
            <Toggle label="Require Names" checked={true} disabled={true} />
            <Toggle label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
            <Toggle label="Shuffle Answers" checked={shuffleAnswers} onChange={setShuffleAnswers} />
            
            <Toggle 
              label="Show Question Feedback" 
              checked={showFeedback} 
              onChange={setShowFeedback} 
              disabled={deliveryMethod === 'Open Navigation'} 
            />
            
            <Toggle label="Show Final Score" checked={showFinalScore} onChange={setShowFinalScore} />
            
            <Toggle 
              label="One Attempt" 
              checked={oneAttempt} 
              onChange={setOneAttempt} 
              info="Học viên chỉ được gửi bài 1 lần duy nhất."
            />
          </div>
        </div>

        {/* Footer Modal */}
        <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
          <Button onClick={handleLaunchActivity} style={{ backgroundColor: '#00a3e0', padding: '14px 40px', fontSize: '18px' }}>
            Launch
          </Button>
        </div>
      </div>
    );
  }
}