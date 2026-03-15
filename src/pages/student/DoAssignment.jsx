// src/pages/student/DoAssignment.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

// --- HỆ THỐNG SVG ICONS TỐI GIẢN (Nét mảnh, màu #003366) ---
const SvgIcons = {
  Submit: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Wait: () => <svg width="48" height="48" fill="none" stroke="#003366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  CheckBig: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Passage: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  LogOut: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Info: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  Lock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
};

export default function DoAssignment() {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [shuffledQuiz, setShuffledQuiz] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [localAnswers, setLocalAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const studentId = localStorage.getItem('currentStudentId');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, async (snap) => {
      if (snap.exists()) {
        const activeSession = snap.data().activeSession;
        if (activeSession && activeSession.status === 'active') {
          setSessionInfo(activeSession);
          const quizSnap = await getDoc(doc(db, "quizzes", activeSession.quizId));
          if (quizSnap.exists()) {
            setQuiz({ id: activeSession.quizId, ...quizSnap.data() });
            setIsSubmitted(false);
          }
        } else {
          setQuiz(null);
          setSessionInfo(null);
          setShuffledQuiz(null);
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!quiz || !sessionInfo) {
      setShuffledQuiz(null);
      return;
    }
    if (shuffledQuiz && shuffledQuiz.id === quiz.id) return; 

    const shuffleArray = (array) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    let processedQuestions = [...(quiz.questions || [])];

    processedQuestions = processedQuestions.map(q => {
      let displayOptions = (q.options || []).map((text, originalIndex) => ({ text, originalIndex }));
      if (sessionInfo?.settings?.shuffleAnswers && q.type === 'MCQ') {
        displayOptions = shuffleArray(displayOptions);
      }
      return { ...q, displayOptions };
    });

    if (sessionInfo?.settings?.shuffleQuestions) {
      const sections = quiz.sections && quiz.sections.length > 0 ? quiz.sections : [{ id: 'default' }];
      let finalQuestions = [];
      sections.forEach(sec => {
        let secQs = processedQuestions.filter(q => q.sectionId === sec.id || (!q.sectionId && sec.id === 'default'));
        secQs = shuffleArray(secQs);
        finalQuestions = finalQuestions.concat(secQs);
      });
      processedQuestions = finalQuestions;
    }

    setShuffledQuiz({ ...quiz, questions: processedQuestions });
  }, [quiz, sessionInfo, shuffledQuiz]);

  const handleSimpleAnswer = (qId, value) => {
    if (lockedQuestions[qId]) return;
    setLocalAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleToggleMCQ = (qId, originalIdx) => {
    if (lockedQuestions[qId]) return;
    setLocalAnswers(prev => {
      const current = prev[qId] || [];
      if (current.includes(originalIdx)) {
        return { ...prev, [qId]: current.filter(i => i !== originalIdx) };
      }
      return { ...prev, [qId]: [...current, originalIdx].sort((a, b) => a - b) };
    });
  };

  const handleGapFillChange = (qId, gapId, value) => {
    if (lockedQuestions[qId]) return;
    setLocalAnswers(prev => {
      const currentObj = prev[qId] || {};
      return { ...prev, [qId]: { ...currentObj, [gapId]: value } };
    });
  };

  const handleLockQuestion = (qId) => {
    if (!localAnswers[qId] || (Array.isArray(localAnswers[qId]) && localAnswers[qId].length === 0) || (typeof localAnswers[qId] === 'object' && !Array.isArray(localAnswers[qId]) && Object.keys(localAnswers[qId]).length === 0)) {
      alert("Vui lòng chọn hoặc nhập đáp án trước khi chốt!");
      return;
    }
    setLockedQuestions(prev => ({ ...prev, [qId]: true }));
  };

  useEffect(() => {
    if (!shuffledQuiz || Object.keys(localAnswers).length === 0 || isSubmitted) return;

    const syncAnswers = async () => {
      const formattedAnswers = {};
      shuffledQuiz.questions.forEach(q => {
        const ans = localAnswers[q.id];
        if (ans === undefined || ans === null) return;

        if (q.type === 'MCQ') {
          formattedAnswers[q.id] = ans.map(i => String.fromCharCode(65 + i)).join(', ');
        } else if (q.type === 'GAP_FILL_PARAGRAPH' || q.type === 'GAP_FILL_DIAGRAM') {
          const parts = [];
          Object.keys(ans).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => parts.push(`[${k}]: ${ans[k]}`));
          formattedAnswers[q.id] = parts.join(' | ');
        } else {
          formattedAnswers[q.id] = ans;
        }
      });

      try {
        await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), {
          studentId: studentId,
          studentName: studentId,
          answers: formattedAnswers,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) { 
        console.error("Lỗi đồng bộ Live Results:", error); 
      }
    };

    const timeoutId = setTimeout(() => {
      syncAnswers();
    }, 800); 

    return () => clearTimeout(timeoutId);
  }, [localAnswers, shuffledQuiz, roomId, studentId, isSubmitted]);

  const handleSubmit = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài không?")) return;

    const formattedAnswers = {};
    if (shuffledQuiz && shuffledQuiz.questions) {
      shuffledQuiz.questions.forEach(q => {
        const ans = localAnswers[q.id];
        if (ans === undefined || ans === null) {
          formattedAnswers[q.id] = '';
          return;
        }

        if (q.type === 'MCQ') {
          formattedAnswers[q.id] = ans.map(i => String.fromCharCode(65 + i)).join(', ');
        } else if (q.type === 'GAP_FILL_PARAGRAPH' || q.type === 'GAP_FILL_DIAGRAM') {
          const parts = [];
          Object.keys(ans).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => parts.push(`[${k}]: ${ans[k]}`));
          formattedAnswers[q.id] = parts.join(' | ');
        } else {
          formattedAnswers[q.id] = ans;
        }
      });
    }

    try {
      await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), {
        studentId: studentId,
        studentName: studentId,
        answers: formattedAnswers,
        submittedAt: new Date().toISOString(),
        score: 0 
      }, { merge: true });
      setIsSubmitted(true);
    } catch (error) { 
      console.error(error); 
      alert("Lỗi nộp bài, vui lòng thử lại.");
    }
  };

  const renderTextWithGaps = (text, qId) => {
    if (!text) return null;
    const formattedText = text.replace(/\n/g, '<br/>');
    const parts = formattedText.split(/\[(\d+)\]/g);
    const isLocked = lockedQuestions[qId];

    return (
      <div style={{ lineHeight: '2.4', fontSize: '15px', color: '#334155' }}>
        {parts.map((part, index) => {
          if (index % 2 === 1) { 
            return (
              <input
                key={index}
                type="text"
                placeholder={part}
                value={(localAnswers[qId] && localAnswers[qId][part]) || ''}
                onChange={(e) => handleGapFillChange(qId, part, e.target.value)}
                disabled={isLocked}
                style={{
                  minWidth: '80px', maxWidth: '100%', margin: '0 6px', padding: '6px 12px', border: 'none',
                  borderBottom: '2px solid #cbd5e1', outline: 'none', textAlign: 'center',
                  fontSize: '15px', color: '#003366', fontWeight: 'bold', backgroundColor: isLocked ? '#f1f5f9' : '#f0f9ff',
                  borderRadius: '6px 6px 0 0', transition: 'all 0.2s ease', boxSizing: 'border-box',
                  cursor: isLocked ? 'not-allowed' : 'text', opacity: isLocked ? 0.7 : 1
                }}
                onFocus={e => { if(!isLocked) { e.target.style.borderBottomColor = '#003366'; e.target.style.backgroundColor = '#e0f2fe'; } }}
                onBlur={e => { if(!isLocked) { e.target.style.borderBottomColor = '#cbd5e1'; e.target.style.backgroundColor = '#f0f9ff'; } }}
              />
            );
          }
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        })}
      </div>
    );
  };

  if (!shuffledQuiz) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#003366', padding: '20px' }}>
        <div style={{ marginBottom: '24px', animation: 'pulse 2s infinite' }}><SvgIcons.Wait /></div>
        <h2 style={{ fontWeight: '800', margin: '0 0 12px 0', textAlign: 'center', fontSize: '22px' }}>Đang chờ giáo viên phát bài...</h2>
        <p style={{ color: '#64748b', marginBottom: '32px', textAlign: 'center' }}>Phòng: <span style={{ fontWeight: '700', color: '#003366' }}>{roomId}</span> | Học viên: <span style={{ fontWeight: '700', color: '#003366' }}>{studentId}</span></p>
        <button onClick={() => navigate('/student/login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <SvgIcons.LogOut /> Thoát phòng
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#003366', padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}><SvgIcons.CheckBig /></div>
        <h2 style={{ fontWeight: '800', margin: '0 0 12px 0', fontSize: '22px' }}>Đã nộp bài thành công!</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>Kết quả của bạn đã được gửi đến giáo viên. Vui lòng giữ nguyên màn hình và chờ hoạt động tiếp theo.</p>
      </div>
    );
  }

  const sections = shuffledQuiz.sections && shuffledQuiz.sections.length > 0 
    ? shuffledQuiz.sections 
    : [{ id: 'default', type: shuffledQuiz.quizMode === 'PASSAGE' ? 'PASSAGE' : 'SINGLE', title: shuffledQuiz.passageTitle || 'Quiz Assignment', passageContent: shuffledQuiz.passage }];

  const isInstantFeedback = sessionInfo?.mode === 'Instant Feedback';
  const showFeedback = sessionInfo?.settings?.showFeedback;

  let globalQuestionIndex = 1;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Josefin Sans', sans-serif" }}>
      
      <header style={{ backgroundColor: 'white', padding: isMobile ? '16px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '18px' : '22px', margin: 0, fontWeight: '800', color: '#003366', textTransform: 'uppercase' }}>{shuffledQuiz.title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#003366', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
            {studentId}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '840px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
        
        {sections.map((section, sIdx) => {
          const secQuestions = (shuffledQuiz.questions || []).filter(q => q.sectionId === section.id || (!q.sectionId && section.id === 'default'));
          if (secQuestions.length === 0 && !section.passageContent) return null;

          return (
            <div key={section.id} style={{ marginBottom: '50px' }}>
              
              {section.type === 'PASSAGE' && (
                <div style={{ backgroundColor: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0ea5e9', marginBottom: '16px' }}>
                    <SvgIcons.Passage />
                    <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Reading Passage</span>
                  </div>
                  <h2 style={{ color: '#003366', marginTop: 0, marginBottom: '24px', fontSize: isMobile ? '22px' : '26px', fontWeight: '800' }}>
                    {section.title}
                  </h2>
                  <div style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {section.passageContent}
                  </div>
                </div>
              )}

              {section.type === 'SINGLE' && section.title && section.title !== 'Quiz Assignment' && (
                <h2 style={{ color: '#003366', fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                  {section.title}
                </h2>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {secQuestions.map((q, qIdx) => {
                  const isLocked = lockedQuestions[q.id];
                  const currentQNum = globalQuestionIndex++;

                  return (
                    <div key={q.id} style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', opacity: isLocked ? 0.9 : 1 }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <span style={{ backgroundColor: '#003366', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px' }}>
                          {currentQNum}
                        </span>
                        {q.wordLimit && (
                          <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                            NO MORE THAN {q.wordLimit} WORDS
                          </span>
                        )}
                        {isLocked && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <SvgIcons.Check /> Đã chốt
                          </span>
                        )}
                      </div>

                      {q.optionsList && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '15px', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                          <div style={{ fontWeight: '800', color: '#003366', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Info /> Reference List:</div>
                          {q.optionsList}
                        </div>
                      )}

                      {q.text && q.type !== 'GAP_FILL_PARAGRAPH' && (
                        <div 
                          style={{ fontSize: '16px', color: '#003366', fontWeight: '700', marginBottom: '24px', lineHeight: '1.6' }}
                          dangerouslySetInnerHTML={{ __html: q.text }}
                        />
                      )}

                      {/* 1. MCQ */}
                      {q.type === 'MCQ' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(q.displayOptions || []).map((optObj, i) => {
                            const originalIdx = optObj.originalIndex;
                            const isChecked = (localAnswers[q.id] || []).includes(originalIdx);
                            return (
                              <div 
                                key={originalIdx} 
                                onClick={() => !isLocked && handleToggleMCQ(q.id, originalIdx)}
                                style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', border: isChecked ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', backgroundColor: isChecked ? '#f0f9ff' : 'white', transition: 'all 0.2s', color: '#334155' }}
                              >
                                <div style={{ marginTop: '2px', width: '22px', height: '22px', borderRadius: '6px', border: isChecked ? 'none' : '2px solid #cbd5e1', backgroundColor: isChecked ? '#003366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0, transition: 'all 0.2s' }}>
                                  {isChecked && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: isChecked ? '700' : '500', lineHeight: '1.6', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                  <span style={{ fontWeight: '800', marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span>
                                  <div dangerouslySetInnerHTML={{ __html: optObj.text }} style={{ flex: 1, margin: 0, padding: 0 }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. EVALUATION (TFNG / YNNG) */}
                      {q.type === 'EVALUATION' && (
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                          {(q.evalType === 'YNNG' ? ['Yes', 'No', 'Not Given'] : ['True', 'False', 'Not Given']).map(opt => {
                            const isSelected = localAnswers[q.id] === opt;
                            return (
                              <div 
                                key={opt} 
                                onClick={() => !isLocked && handleSimpleAnswer(q.id, opt)}
                                style={{ flex: 1, textAlign: 'center', padding: '16px', border: isSelected ? '2px solid #003366' : '1px solid #e2e8f0', borderRadius: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', fontWeight: '700', color: isSelected ? '#003366' : '#64748b', backgroundColor: isSelected ? '#f0f9ff' : 'white', transition: 'all 0.2s' }}
                              >
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. MATCHING & SAQ */}
                      {['MATCHING', 'SAQ'].includes(q.type) && (
                        <input 
                          type="text" 
                          placeholder="Nhập câu trả lời của bạn..." 
                          value={localAnswers[q.id] || ''} 
                          onChange={(e) => handleSimpleAnswer(q.id, e.target.value)}
                          disabled={isLocked}
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', color: '#003366', fontWeight: '600', boxSizing: 'border-box', backgroundColor: isLocked ? '#f1f5f9' : '#f8fafc', transition: 'border-color 0.2s', cursor: isLocked ? 'not-allowed' : 'text' }}
                          onFocus={e => { if(!isLocked){ e.target.style.borderColor = '#003366'; e.target.style.backgroundColor = 'white';} }}
                          onBlur={e => { if(!isLocked){ e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc';} }}
                        />
                      )}

                      {/* 4. GAP FILL DIAGRAM */}
                      {q.type === 'GAP_FILL_DIAGRAM' && (
                        <div style={{ marginBottom: '15px' }}>
                          {q.imageUrl && (
                            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '20px', width: '100%' }}>
                              <img src={q.imageUrl} alt="Diagram" style={{ display: 'block', maxWidth: '100%', height: 'auto', opacity: isLocked ? 0.8 : 1 }} />
                              {(q.labels || []).map(lbl => (
                                <div key={lbl.id} style={{ position: 'absolute', left: `${lbl.x}%`, top: `${lbl.y}%`, transform: 'translate(-50%, -50%)', background: '#0ea5e9', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '2px solid white' }}>
                                  {lbl.id}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {(q.labels && q.labels.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                              {q.labels.map(lbl => (
                                <div key={lbl.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: isLocked ? '#f1f5f9' : 'white', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                                  <span style={{ backgroundColor: '#0ea5e9', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>{lbl.id}</span>
                                  <input 
                                    type="text" placeholder={`Nhập đáp án nhãn ${lbl.id}...`} 
                                    value={(localAnswers[q.id] && localAnswers[q.id][lbl.id]) || ''} 
                                    onChange={(e) => handleGapFillChange(q.id, lbl.id, e.target.value)}
                                    disabled={isLocked}
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#003366', fontWeight: '600', width: '100%', minWidth: '0', backgroundColor: 'transparent', cursor: isLocked ? 'not-allowed' : 'text' }} 
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. GAP FILL PARAGRAPH */}
                      {q.type === 'GAP_FILL_PARAGRAPH' && (
                        <div style={{ padding: isMobile ? '16px' : '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
                          {renderTextWithGaps(q.text, q.id)}
                        </div>
                      )}

                      {/* NÚT CHỐT ĐÁP ÁN (INSTANT FEEDBACK) */}
                      {isInstantFeedback && !isLocked && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                          <button 
                            onClick={() => handleLockQuestion(q.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '700', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(14,165,233,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0284c7'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                          >
                            <SvgIcons.Lock /> Chốt đáp án
                          </button>
                        </div>
                      )}

                      {/* HIỂN THỊ GIẢI THÍCH KHI ĐÃ CHỐT */}
                      {isInstantFeedback && isLocked && showFeedback && (
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '14px', lineHeight: '1.6' }}>
                          <div style={{ fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <SvgIcons.Info /> Giải thích / Feedback:
                          </div>
                          {q.explanation ? q.explanation : 'Không có giải thích chi tiết cho câu hỏi này.'}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* NÚT SUBMIT TOÀN BỘ BÀI */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <button 
            onClick={handleSubmit} 
            style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: '#003366', color: 'white', fontWeight: '800', padding: '16px 40px', fontSize: '16px', borderRadius: '100px', cursor: 'pointer', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,51,102,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <SvgIcons.Submit /> Submit Assignment
          </button>
        </div>
        
      </div>
    </div>
  );
}