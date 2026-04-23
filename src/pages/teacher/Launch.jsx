// src/pages/teacher/Launch.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TeacherContext } from './TeacherDashboard';

// --- HỆ THỐNG SVG ICONS TỐI GIẢN ---
const SvgIcons = {
  Quiz: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Race: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
  Calendar: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Back: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Instant: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Open: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
  Teacher: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Rocket: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13.5 22H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6.5"></path><path d="M22 17.5L18 22l-4.5-4.5"></path><line x1="18" y1="22" x2="18" y2="12"></line></svg>,
  RaceRocket: () => <span style={{ fontSize: '24px', display: 'inline-block', lineHeight: 1 }}>🚀</span>,
  RaceUFO: () => <span style={{ fontSize: '24px', display: 'inline-block', lineHeight: 1 }}>🛸</span>,
  RaceCar: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🏎️</span>,
  RaceBug: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🐛</span>,
  RaceDino: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🦖</span>,
  RaceHorse: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🐎</span>,
};

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

const MethodCard = ({ title, icon, description, active, onClick }) => (
  <div onClick={onClick} style={{
    border: active ? '2px solid #003366' : '1px solid #cbd5e1',
    borderRadius: '12px', padding: '20px', marginBottom: '15px', cursor: 'pointer',
    backgroundColor: active ? '#f0f9ff' : 'white', transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: active ? '10px' : '0' }}>
      <div style={{ color: active ? '#003366' : '#94a3b8', display: 'flex' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: '16px', fontWeight: active ? '800' : '600', color: active ? '#003366' : '#475569' }}>{title}</div>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: active ? '6px solid #003366' : '2px solid #cbd5e1', backgroundColor: 'white', transition: 'border 0.2s ease', flexShrink: 0 }} />
    </div>
    {active && description && (
      <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginLeft: '35px' }}>{description}</div>
    )}
  </div>
);

export default function Launch() {
  const navigate = useNavigate();
  const { activeRoom } = useContext(TeacherContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [quizzes, setQuizzes] = useState([]);
  const [step, setStep] = useState('MENU');
  
  // Modes
  const [activeMode, setActiveMode] = useState('NORMAL'); // NORMAL, SPACE_RACE, WEEKLY
  const [selectedQuizId, setSelectedQuizId] = useState('');

  // Settings
  const [deliveryMethod, setDeliveryMethod] = useState('Instant Feedback');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [oneAttempt, setOneAttempt] = useState(true);
  const [hasTimer, setHasTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState('');

  // Space Race Settings
  const [teamCount, setTeamCount] = useState(2);
  const [raceIcon, setRaceIcon] = useState('Rocket');

  // Weekly Planner Settings
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1); // Get Monday
    return d.toISOString().split('T')[0];
  });
  const [commonOpen, setCommonOpen] = useState('08:00');
  const [commonClose, setCommonClose] = useState('22:00');
  const [commonTimer, setCommonTimer] = useState('15');

  const initialWeeklyDays = [
    { id: 0, label: 'Thứ 2', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 1, label: 'Thứ 3', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 2, label: 'Thứ 4', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 3, label: 'Thứ 5', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 4, label: 'Thứ 6', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 5, label: 'Thứ 7', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' },
    { id: 6, label: 'Chủ Nhật', quizId: '', openTime: '08:00', closeTime: '22:00', timer: '15' }
  ];
  const [weeklyDays, setWeeklyDays] = useState(initialWeeklyDays);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const qSnap = await getDocs(collection(db, "quizzes"));
      setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(q => !q.isDeleted));
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (deliveryMethod !== 'Instant Feedback' || !oneAttempt) {
      setHasTimer(false); setTimeLimit('');
    }
  }, [deliveryMethod, oneAttempt]);

  const handleApplyCommonWeekly = () => {
    setWeeklyDays(prev => prev.map(d => ({ ...d, openTime: commonOpen, closeTime: commonClose, timer: commonTimer })));
  };

  const evaluateAnswer = (question, studentAnswer) => {
    if (!studentAnswer) return false;
    const ans = String(studentAnswer).trim().toLowerCase();
    if (question.type === 'MCQ') return ans === (question.correctOptions || []).sort().map(i => String.fromCharCode(65 + i)).join(', ').toLowerCase();
    if (['EVALUATION', 'MATCHING'].includes(question.type)) return ans === String(question.correctOption || question.correctMatch || '').trim().toLowerCase();
    if (question.type === 'SAQ') return (question.correctText || '').split(',').map(s => s.trim().toLowerCase()).includes(ans);
    if (question.type.startsWith('GAP_FILL')) {
       let allCorrect = true;
       const items = question.type === 'GAP_FILL_PARAGRAPH' ? question.gaps : question.labels;
       if (!items || items.length === 0) return false;
       items.forEach(item => {
         const correctAnsArray = (item.answerString || '').split(',').map(s => s.trim().toLowerCase());
         const match = studentAnswer.match(new RegExp(`\\[${item.id}\\]:\\s*([^|]+)`));
         if (match && !correctAnsArray.includes(match[1].trim().toLowerCase())) allCorrect = false;
         else if (!match) allCorrect = false;
       });
       return allCorrect;
    }
    return false;
  };

  const handleLaunchActivity = async () => {
    if (!activeRoom) return alert("Vui lòng chọn Lớp học (Room) ở góc phải màn hình trước khi Launch!");
    
    let activeDaysToSave = [];
    if (activeMode === 'WEEKLY') {
      activeDaysToSave = weeklyDays.filter(d => d.quizId).map(d => {
        const baseDate = new Date(weekStartDate);
        baseDate.setDate(baseDate.getDate() + d.id);
        const dateStr = baseDate.toISOString().split('T')[0];
        
        // Parse as Local Time, store as ISO String
        const [oH, oM] = d.openTime.split(':');
        const start = new Date(baseDate); start.setHours(oH, oM, 0, 0);
        
        const [cH, cM] = d.closeTime.split(':');
        const end = new Date(baseDate); end.setHours(cH, cM, 0, 0);

        const quizData = quizzes.find(q => q.id === d.quizId);
        return {
          day: d.label, date: dateStr,
          quizId: d.quizId, quizTitle: quizData?.title || 'Unknown',
          startTime: start.toISOString(), endTime: end.toISOString(),
          timer: parseInt(d.timer) || null
        };
      });

      if (activeDaysToSave.length === 0) return alert("Vui lòng chọn bài tập cho ít nhất 1 ngày!");
      for (let d of activeDaysToSave) {
        if (new Date(d.startTime) >= new Date(d.endTime)) return alert(`Lỗi ở ${d.day}: Giờ đóng phải sau giờ mở!`);
      }
    } else {
      if (hasTimer && (!timeLimit || isNaN(timeLimit) || parseInt(timeLimit) <= 0)) {
        return alert("Vui lòng nhập thời gian làm bài hợp lệ (lớn hơn 0 phút).");
      }
    }

    try {
      const roomSnap = await getDoc(doc(db, "rooms", activeRoom));
      const roomData = roomSnap.data();

      if (roomData?.activeSession) {
        if(!window.confirm(`Lớp ${activeRoom} đang có hoạt động diễn ra. Dừng bài cũ và chạy bài mới này? (Kết quả bài cũ sẽ được TỰ ĐỘNG LƯU vào Reports)`)) return;
        
        const oldSession = roomData.activeSession;
        const roster = roomData.students || [];
        let oldQuizData = null;
        
        // Xử lý lưu report bài cũ (Dù là Normal, SpaceRace hay Weekly)
        const activeQuizId = oldSession.mode === 'Weekly' && oldSession.activeDays 
              ? oldSession.activeDays[oldSession.currentDayIndex]?.quizId 
              : oldSession.quizId;

        if (activeQuizId) {
           const qSnap = await getDoc(doc(db, "quizzes", activeQuizId));
           if (qSnap.exists()) oldQuizData = { id: qSnap.id, ...qSnap.data() };
        }

        const subDocsSnap = await getDocs(collection(db, `rooms/${activeRoom}/submissions`));
        const oldSubmissions = subDocsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (oldQuizData) {
          const processedSubmissions = roster.map(student => {
            const sub = oldSubmissions.find(s => s.studentId === student.studentId || s.id === student.studentId);
            const evaluatedAnswers = {};
            let correctCount = 0;
            oldQuizData.questions.forEach(q => {
              const stAns = sub?.answers?.[q.id] || '';
              const isCorrect = evaluateAnswer(q, stAns);
              if (isCorrect) correctCount++;
              evaluatedAnswers[q.id] = { answer: stAns, isCorrect };
            });
            const score = Math.round((correctCount / oldQuizData.questions.length) * 100) || 0;
            return { ...student, answers: evaluatedAnswers, score, submitted: !!sub?.submittedAt, sessions: sub?.sessions || [], team: sub?.team || null };
          });

          const questionsToSave = oldQuizData.questions.map(q => ({ 
            id: q.id, type: q.type, text: q.text, options: q.options || [], correctOptions: q.correctOptions || [], correctOption: q.correctOption || '', correctMatch: q.correctMatch || '', correctText: q.correctText || '', gaps: q.gaps || [], labels: q.labels || [], explanation: q.explanation || ''
          }));

          let reportName = oldSession.quizTitle || "Untitled Activity";
          if (oldSession.mode === 'Weekly' && oldSession.activeDays) {
             const d = oldSession.activeDays[oldSession.currentDayIndex];
             if (d) reportName = `[Weekly - ${d.day}] ${d.quizTitle}`;
          }

          await addDoc(collection(db, "reports"), {
            name: reportName, date: new Date().toISOString(), room: activeRoom,
            type: oldSession.mode || "Quiz", totalStudents: roster.length,
            questions: questionsToSave, submissions: processedSubmissions
          });
        }
        
        for (const subDoc of subDocsSnap.docs) await deleteDoc(doc(db, `rooms/${activeRoom}/submissions`, subDoc.id));
      } else {
        const subDocs = await getDocs(collection(db, `rooms/${activeRoom}/submissions`));
        for (const subDoc of subDocs.docs) await deleteDoc(doc(db, `rooms/${activeRoom}/submissions`, subDoc.id));
      }

      // XÂY DỰNG OBJECT PHÁT BÀI MỚI
      let activeSessionObject = {};
      if (activeMode === 'WEEKLY') {
        activeSessionObject = {
          mode: 'Weekly',
          activeDays: activeDaysToSave,
          currentDayIndex: 0,
          settings: { shuffleQuestions, shuffleAnswers, showFeedback, showFinalScore, oneAttempt: true },
          status: 'active',
          startTime: new Date().toISOString()
        };
      } else {
        const quizData = quizzes.find(q => q.id === selectedQuizId);
        activeSessionObject = {
          quizId: selectedQuizId,
          quizTitle: quizData.title,
          mode: activeMode === 'SPACE_RACE' ? 'Space Race' : deliveryMethod,
          settings: activeMode === 'SPACE_RACE' ? {
            teamCount: parseInt(teamCount), raceIcon: raceIcon, shuffleQuestions, shuffleAnswers, showFeedback
          } : { 
            shuffleQuestions, shuffleAnswers, showFeedback, showFinalScore, oneAttempt,
            timeLimit: hasTimer && timeLimit ? parseInt(timeLimit) : null
          },
          currentQuestionIndex: (activeMode === 'NORMAL' && deliveryMethod === 'Teacher Paced') ? 0 : null,
          status: 'active',
          startTime: new Date().toISOString()
        };
      }

      await updateDoc(doc(db, "rooms", activeRoom), { activeSession: activeSessionObject });
      navigate('/teacher/live');
    } catch (error) {
      console.error("Lỗi khởi chạy:", error); alert("Lỗi kết nối. Không thể khởi chạy bài tập.");
    }
  };

  return (
    <div style={{ padding: isMobile ? '15px' : '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Josefin Sans', sans-serif", position: 'relative' }}>
      
      <h2 style={{ color: '#003366', margin: '0 0 24px 0', fontSize: isMobile ? '24px' : '28px', fontWeight: '800' }}>Launch</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
        <button 
          onClick={() => { setActiveMode('NORMAL'); setStep('SELECT_QUIZ'); }} 
          style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s ease', color: '#003366', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%' }}
        >
          <SvgIcons.Quiz />
          <span style={{ fontWeight: '800', fontSize: '18px' }}>Bài kiểm tra</span>
        </button>

        <button 
          onClick={() => { setActiveMode('SPACE_RACE'); setStep('SELECT_QUIZ'); }} 
          style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s ease', color: '#003366', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%' }}
        >
          <SvgIcons.Race />
          <span style={{ fontWeight: '800', fontSize: '18px' }}>Thi đua</span>
        </button>

        {/* NÚT MỚI: GIAO BÀI THEO TUẦN */}
        <button 
          onClick={() => { setActiveMode('WEEKLY'); setStep('WEEKLY_CONFIG'); }} 
          style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s ease', color: '#0ea5e9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%' }}
        >
          <SvgIcons.Calendar />
          <span style={{ fontWeight: '800', fontSize: '18px' }}>Giao bài theo Tuần</span>
        </button>
      </div>

      {step !== 'MENU' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '15px', boxSizing: 'border-box' }}>
          
          {/* STEP: SELECT_QUIZ CHO NORMAL & SPACE RACE */}
          {step === 'SELECT_QUIZ' && (
            <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                <h2 style={{ color: '#003366', margin: 0, fontWeight: '800', fontSize: isMobile ? '20px' : '24px' }}>Chọn bài tập từ Thư viện</h2>
                <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '4px' }}><SvgIcons.Close /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quizzes.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 0', fontSize: '15px' }}>Thư viện chưa có bài tập nào.</p> : quizzes.map(q => (
                  <div 
                    key={q.id} onClick={() => { setSelectedQuizId(q.id); setStep('CONFIG'); }}
                    style={{ padding: '16px 20px', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: '700', color: '#003366', fontSize: '16px' }}>{q.title}</div>
                    <div style={{ color: '#64748b', fontSize: '13px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '100px', fontWeight: '600', border: '1px solid #e2e8f0' }}>{q.questions?.length || 0} câu hỏi</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: CONFIG CHO NORMAL & SPACE RACE */}
          {step === 'CONFIG' && (
            <div style={{ backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '16px 20px' : '24px 30px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: '24px 24px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setStep('SELECT_QUIZ')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#003366', display: 'flex', padding: '4px' }}><SvgIcons.Back /></button>
                  <h2 style={{ color: '#003366', margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: '800', textTransform: 'uppercase' }}>{quizzes.find(q => q.id === selectedQuizId)?.title}</h2>
                </div>
                <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><SvgIcons.Close /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '25px' : '40px', padding: isMobile ? '20px' : '30px' }}>
                {activeMode === 'NORMAL' ? (
                  <>
                    <div>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Method</h3>
                      <MethodCard title="Instant Feedback" icon={<SvgIcons.Instant />} active={deliveryMethod === 'Instant Feedback'} onClick={() => { setDeliveryMethod('Instant Feedback'); setShuffleQuestions(false); setShuffleAnswers(false); setOneAttempt(true); }} description="Học viên làm câu hỏi theo thứ tự và không thể đổi đáp án." />
                      <MethodCard title="Open Navigation" icon={<SvgIcons.Open />} active={deliveryMethod === 'Open Navigation'} onClick={() => { setDeliveryMethod('Open Navigation'); setShowFeedback(false); setOneAttempt(false); }} description="Tự do chuyển câu hỏi và đổi đáp án." />
                      <MethodCard title="Teacher Paced" icon={<SvgIcons.Teacher />} active={deliveryMethod === 'Teacher Paced'} onClick={() => { setDeliveryMethod('Teacher Paced'); setShuffleQuestions(false); }} description="Giáo viên điều khiển tiến trình." />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Settings</h3>
                      <Toggle label="Require Names" checked={true} disabled={true} />
                      <Toggle label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} disabled={deliveryMethod === 'Teacher Paced'} />
                      <Toggle label="Shuffle Answers" checked={shuffleAnswers} onChange={setShuffleAnswers} />
                      <Toggle label="Show Question Feedback" checked={showFeedback} onChange={setShowFeedback} disabled={deliveryMethod === 'Open Navigation'} />
                      <Toggle label="Show Final Score" checked={showFinalScore} onChange={setShowFinalScore} />
                      <Toggle label="One Attempt" checked={oneAttempt} onChange={setOneAttempt} />
                      <Toggle label="Timer (Đếm ngược)" checked={hasTimer} onChange={setHasTimer} disabled={deliveryMethod !== 'Instant Feedback' || !oneAttempt} />
                      {hasTimer && (
                        <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <input type="number" placeholder="Số phút (VD: 15)..." value={timeLimit} onChange={e => setTimeLimit(e.target.value)} min="1" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#003366', fontWeight: '600', boxSizing: 'border-box' }} />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Thi đua (Đường Đua Thú Dzị)</h3>
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '8px' }}>Số lượng đội (Từ 2 - 10)</label>
                        <select value={teamCount} onChange={(e) => setTeamCount(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '700', color: '#334155' }}>
                          {[...Array(9)].map((_, i) => <option key={i+2} value={i+2}>{i+2} Đội</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '8px' }}>Biểu tượng Đường đua</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {['Rocket', 'UFO', 'Car', 'Bug', 'Dino', 'Horse'].map(icon => (
                            <div key={icon} onClick={() => setRaceIcon(icon)} style={{ padding: '8px 16px', borderRadius: '12px', border: raceIcon === icon ? '2px solid #003366' : '1px solid #cbd5e1', backgroundColor: raceIcon === icon ? '#f0f9ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: raceIcon === icon ? '#003366' : '#64748b', transition: 'all 0.2s' }}>
                              {icon === 'Rocket' && <SvgIcons.RaceRocket />}
                              {icon === 'UFO' && <SvgIcons.RaceUFO />}
                              {icon === 'Car' && <SvgIcons.RaceCar />}
                              {icon === 'Bug' && <SvgIcons.RaceBug />}
                              {icon === 'Dino' && <SvgIcons.RaceDino />}
                              {icon === 'Horse' && <SvgIcons.RaceHorse />}
                              <span style={{ fontSize: '14px' }}>{icon}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Settings</h3>
                      <Toggle label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
                      <Toggle label="Shuffle Answers" checked={shuffleAnswers} onChange={setShuffleAnswers} />
                      <Toggle label="Show Question Feedback" checked={showFeedback} onChange={setShowFeedback} />
                      <div style={{ padding: '14px', backgroundColor: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a', marginTop: '16px', fontSize: '13px', color: '#d97706', lineHeight: '1.6' }}>
                        * Học viên sẽ làm bài với giao diện Instant Feedback để đua trực tiếp.<br/>
                        * Học viên sẽ tự chọn Đội (Team) trước khi bắt đầu làm bài.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
                <button onClick={handleLaunchActivity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', backgroundColor: '#003366', color: 'white', padding: '14px 32px', fontSize: '15px', fontWeight: '700', borderRadius: '100px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
                  <SvgIcons.Rocket /> Launch
                </button>
              </div>
            </div>
          )}

          {/* STEP: WEEKLY_CONFIG CHO GIAO BÀI THEO TUẦN */}
          {step === 'WEEKLY_CONFIG' && (
            <div style={{ backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '16px 20px' : '24px 30px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderRadius: '24px 24px 0 0', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#0ea5e9' }}><SvgIcons.Calendar /></div>
                  <h2 style={{ color: '#003366', margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: '800', textTransform: 'uppercase' }}>Thiết lập Giao bài theo Tuần</h2>
                </div>
                <button onClick={() => setStep('MENU')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><SvgIcons.Close /></button>
              </div>

              <div style={{ padding: isMobile ? '20px' : '30px' }}>
                
                {/* GLOBAL SETTINGS */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ fontSize: '15px', color: '#0369a1', marginTop: 0, marginBottom: '16px', fontWeight: '800' }}>Cài đặt chung (Áp dụng cho tất cả ngày)</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '100px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#003366', marginBottom: '4px' }}>Giờ Mở</label>
                        <input type="time" value={commonOpen} onChange={e => setCommonOpen(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '100px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#003366', marginBottom: '4px' }}>Giờ Đóng</label>
                        <input type="time" value={commonClose} onChange={e => setCommonClose(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: '100px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#003366', marginBottom: '4px' }}>Timer (Phút)</label>
                        <input type="number" placeholder="Phút" value={commonTimer} onChange={e => setCommonTimer(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                    </div>
                    <button onClick={handleApplyCommonWeekly} style={{ marginTop: '16px', width: '100%', padding: '10px', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Áp dụng chung</button>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '14px', color: '#64748b', marginTop: 0, marginBottom: '15px', fontWeight: '800', textTransform: 'uppercase' }}>Settings (Instant Feedback)</h3>
                    <Toggle label="Shuffle Questions" checked={shuffleQuestions} onChange={setShuffleQuestions} />
                    <Toggle label="Shuffle Answers" checked={shuffleAnswers} onChange={setShuffleAnswers} />
                    <Toggle label="Show Question Feedback" checked={showFeedback} onChange={setShowFeedback} />
                    <Toggle label="Show Final Score" checked={showFinalScore} onChange={setShowFinalScore} />
                    <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px', marginTop: '10px', fontSize: '13px', color: '#b91c1c', fontWeight: '600' }}>
                      * Chế độ giao bài theo tuần mặc định One Attempt và Instant Feedback.
                    </div>
                  </div>
                </div>

                {/* WEEKLY PLANNER TABLE */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', color: '#003366', margin: 0, fontWeight: '800' }}>Lịch Giao Bài</h3>
                    <input type="date" value={weekStartDate} onChange={e => setWeekStartDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #003366', outline: 'none', fontWeight: '700', color: '#003366' }} />
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{'(Chọn ngày bắt đầu - Thứ 2)'}</span>
                  </div>

                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '800', fontSize: '13px' }}>Ngày</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '800', fontSize: '13px', width: '35%' }}>Bài tập (Quiz)</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '800', fontSize: '13px' }}>Giờ Mở</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '800', fontSize: '13px' }}>Giờ Đóng</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '800', fontSize: '13px' }}>Timer (Phút)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyDays.map((d, index) => {
                          const dateObj = new Date(weekStartDate);
                          dateObj.setDate(dateObj.getDate() + d.id);
                          const dateString = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                          
                          return (
                            <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: '700', color: '#003366' }}>{d.label} <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', display: 'block' }}>{dateString}</span></td>
                              <td style={{ padding: '12px 16px' }}>
                                <select value={d.quizId} onChange={e => { const newD = [...weeklyDays]; newD[index].quizId = e.target.value; setWeeklyDays(newD); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                                  <option value="">-- Không giao bài --</option>
                                  {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: '12px 16px' }}><input type="time" value={d.openTime} onChange={e => { const newD = [...weeklyDays]; newD[index].openTime = e.target.value; setWeeklyDays(newD); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={!d.quizId} /></td>
                              <td style={{ padding: '12px 16px' }}><input type="time" value={d.closeTime} onChange={e => { const newD = [...weeklyDays]; newD[index].closeTime = e.target.value; setWeeklyDays(newD); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={!d.quizId} /></td>
                              <td style={{ padding: '12px 16px' }}><input type="number" placeholder="Phút" value={d.timer} onChange={e => { const newD = [...weeklyDays]; newD[index].timer = e.target.value; setWeeklyDays(newD); }} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} disabled={!d.quizId} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              <div style={{ padding: '20px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
                <button onClick={handleLaunchActivity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', backgroundColor: '#003366', color: 'white', padding: '14px 32px', fontSize: '15px', fontWeight: '700', borderRadius: '100px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)', transition: 'all 0.2s' }}>
                  <SvgIcons.Rocket /> Launch Weekly
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}