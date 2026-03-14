// src/pages/teacher/LiveResults.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TeacherContext } from './TeacherDashboard';

// --- COMPONENT: TOGGLE SWITCH ---
const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onChange(!checked)}>
    <div style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: checked ? '#003366' : '#cbd5e1', position: 'relative', transition: 'all 0.2s' }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: checked ? '18px' : '2px', transition: 'all 0.2s' }} />
    </div>
    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>{label}</span>
  </div>
);

export default function LiveResults() {
  const navigate = useNavigate();
  const { activeRoom } = useContext(TeacherContext);
  
  const [sessionInfo, setSessionInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Toggles hiển thị
  const [showNames, setShowNames] = useState(true);
  const [showResponses, setShowResponses] = useState(true);
  const [showResults, setShowResults] = useState(true);

  // Lắng nghe dữ liệu Real-time
  useEffect(() => {
    if (!activeRoom) return;

    // Lấy thông tin phiên đang chạy và danh sách học viên trong Room
    const roomUnsub = onSnapshot(doc(db, "rooms", activeRoom), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSessionInfo(data.activeSession || null);
        setRoster(data.students || []);
      }
    });

    // Lắng nghe bài nộp của học viên trong Room hiện tại
    const subUnsub = onSnapshot(collection(db, `rooms/${activeRoom}/submissions`), (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { roomUnsub(); subUnsub(); };
  }, [activeRoom]);

  // Xử lý Kết thúc Activity và chuyển dữ liệu sang Reports
  const handleFinishActivity = async () => {
    if (!window.confirm("Bạn có chắc muốn kết thúc bài tập này? Kết quả sẽ được lưu vào Reports.")) return;
    if (!activeRoom || !sessionInfo) return;

    try {
      // 1. Lưu bản ghi vào Reports
      const reportData = {
        name: sessionInfo.quizTitle || "Untitled Activity",
        date: new Date().toISOString(),
        room: activeRoom,
        type: sessionInfo.mode || "Quiz",
        totalStudents: roster.length,
        submissions: submissions, 
        roster: roster
      };
      await addDoc(collection(db, "reports"), reportData);

      // 2. Dọn dẹp Submissions hiện tại trong Room
      const subDocs = await getDocs(collection(db, `rooms/${activeRoom}/submissions`));
      for (const subDoc of subDocs.docs) {
        await deleteDoc(doc(db, `rooms/${activeRoom}/submissions`, subDoc.id));
      }

      // 3. Xóa activeSession khỏi Room
      await updateDoc(doc(db, "rooms", activeRoom), { activeSession: null });

      alert("Đã lưu kết quả thành công vào Reports!");
      navigate('/teacher/reports');
    } catch (error) {
      console.error("Lỗi khi lưu Report:", error);
      alert("Có lỗi xảy ra khi kết thúc Activity.");
    }
  };

  if (!activeRoom) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Vui lòng chọn lớp học (Room) ở thanh công cụ phía trên để xem Live Results.</div>;
  if (!sessionInfo) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Lớp <span style={{ color: '#003366', fontWeight: '700' }}>{activeRoom}</span> hiện không có hoạt động nào đang diễn ra. Hãy vào thẻ Launch để phát bài.</div>;

  // Giả lập lấy danh sách câu hỏi dựa trên bài nộp đầu tiên (Trong thực tế cần lấy từ cấu trúc quiz gốc)
  const questionKeys = submissions.length > 0 && submissions[0].answers ? Object.keys(submissions[0].answers).sort() : ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HEADER & ACTIVITY CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ color: '#003366', margin: 0, fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>{sessionInfo.quizTitle || 'Đang chạy Activity...'}</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px', fontWeight: '500' }}>Room: <span style={{ color: '#e67e22', fontWeight: '700' }}>{activeRoom}</span> • Mode: <span style={{ fontWeight: '600', color: '#334155' }}>{sessionInfo.mode}</span></p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ backgroundColor: 'white', color: '#003366', border: '2px solid #003366', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Invite Students
          </button>
          <button onClick={() => setIsPaused(!isPaused)} style={{ backgroundColor: isPaused ? '#f59e0b' : '#f8fafc', color: isPaused ? 'white' : '#475569', border: isPaused ? 'none' : '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={handleFinishActivity} style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
            Finish Activity
          </button>
        </div>
      </div>

      {/* TOGGLES */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '24px', padding: '0 10px' }}>
        <Toggle label="Show Names" checked={showNames} onChange={setShowNames} />
        <Toggle label="Show Responses" checked={showResponses} onChange={setShowResponses} />
        <Toggle label="Show Results" checked={showResults} onChange={setShowResults} />
      </div>

      {/* RESPONSE MATRIX (TABLE) */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', color: '#475569', width: '200px' }}>Name</th>
              <th style={{ padding: '16px', color: '#475569', width: '100px' }}>Score %</th>
              {questionKeys.map((q, idx) => (
                <th key={idx} style={{ padding: '16px', color: '#003366', fontWeight: '800' }}>{idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 ? (
              <tr><td colSpan={questionKeys.length + 2} style={{ padding: '40px', color: '#94a3b8' }}>Chưa có học viên nào trong Roster của lớp.</td></tr>
            ) : (
              roster.map((student, index) => {
                const sub = submissions.find(s => s.id === student.studentId || s.studentId === student.studentId);
                const score = sub ? Math.floor(Math.random() * 40) + 60 : 0; // Giả lập tính điểm

                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#003366' }}>
                      {showNames ? `${student.lastName} ${student.firstName}` : '••••••••'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', color: sub ? '#10b981' : '#94a3b8' }}>
                      {sub ? `${score}%` : '-'}
                    </td>
                    
                    {/* Render các ô đáp án */}
                    {questionKeys.map((qKey, idx) => {
                      const ans = sub?.answers ? sub.answers[qKey] : null;
                      const isCorrect = Math.random() > 0.3; // Giả lập check đúng sai
                      
                      let cellBg = 'transparent';
                      let cellColor = '#334155';
                      let cellText = showResponses ? (ans || '') : '✓';

                      if (!sub) {
                        cellText = '';
                      } else if (showResults && ans) {
                        cellBg = isCorrect ? '#dcfce7' : '#fee2e2'; 
                        cellColor = isCorrect ? '#15803d' : '#b91c1c';
                      }

                      return (
                        <td key={idx} style={{ padding: '10px' }}>
                          <div style={{ backgroundColor: cellBg, color: cellColor, padding: '8px', borderRadius: '8px', fontWeight: '700', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: sub && !showResults ? '1px solid #e2e8f0' : 'none' }}>
                            {cellText}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}