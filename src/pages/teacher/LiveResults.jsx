import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import { TeacherContext } from './TeacherDashboard';

export default function LiveResults() {
  const navigate = useNavigate();
  const { activeRoom } = useContext(TeacherContext);
  const [submissions, setSubmissions] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Visibility Toggles
  const [showNames, setShowNames] = useState(true);
  const [showResponses, setShowResponses] = useState(true);
  const [showResults, setShowResults] = useState(true);

  useEffect(() => {
    if (!activeRoom) return;

    // Lắng nghe trạng thái session của Room
    const roomUnsub = onSnapshot(doc(db, "rooms", activeRoom), (docSnap) => {
      if (docSnap.exists()) {
        setSessionInfo(docSnap.data().activeSession || null);
      }
    });

    // Lắng nghe dữ liệu học viên nộp bài
    const subUnsub = onSnapshot(collection(db, `rooms/${activeRoom}/submissions`), (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { roomUnsub(); subUnsub(); };
  }, [activeRoom]);

  const handleFinish = async () => {
    if(!window.confirm("Kết thúc hoạt động này? Dữ liệu sẽ được lưu vào Reports.")) return;
    
    try {
      // 1. Lưu vào Reports
      if (sessionInfo && submissions.length > 0) {
        await addDoc(collection(db, "reports"), {
          room: activeRoom,
          quizTitle: sessionInfo.quizTitle,
          mode: sessionInfo.mode,
          date: new Date().toISOString(),
          results: submissions
        });
      }

      // 2. Xóa active session trong Room
      await updateDoc(doc(db, "rooms", activeRoom), { activeSession: null });

      // 3. Xóa các document trong collection submissions
      const subDocs = await getDocs(collection(db, `rooms/${activeRoom}/submissions`));
      subDocs.forEach(async (d) => {
        await deleteDoc(doc(db, `rooms/${activeRoom}/submissions`, d.id));
      });

      navigate('/teacher/reports');
    } catch (error) {
      console.error("Lỗi khi kết thúc:", error);
    }
  };

  const toggleBtnStyle = (active) => ({
    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
    backgroundColor: active ? '#003366' : 'transparent',
    color: active ? 'white' : '#64748b',
    border: active ? 'none' : '1px solid #cbd5e1',
    fontWeight: '600', fontSize: '13px', fontFamily: "'Josefin Sans', sans-serif"
  });

  if (!sessionInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>📡</div>
        <h3 style={{ margin: 0, color: '#475569' }}>Không có hoạt động nào đang diễn ra ở lớp {activeRoom}</h3>
        <p>Hãy vào tab Launch để khởi chạy một bài tập.</p>
      </div>
    );
  }

  const questionKeys = submissions.length > 0 && submissions[0].answers ? Object.keys(submissions[0].answers).sort() : ['Q1', 'Q2'];

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#003366', margin: '0 0 10px 0', fontSize: '22px' }}>{sessionInfo.quizTitle}</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setShowNames(!showNames)} style={toggleBtnStyle(showNames)}>Names</button>
            <button onClick={() => setShowResponses(!showResponses)} style={toggleBtnStyle(showResponses)}>Responses</button>
            <button onClick={() => setShowResults(!showResults)} style={toggleBtnStyle(showResults)}>Results</button>
          </div>
        </div>
        <Button onClick={handleFinish} variant="outline">Finish Activity</Button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', color: '#334155' }}>Name</th>
              <th style={{ padding: '12px 15px', color: '#334155' }}>Progress</th>
              {questionKeys.map((qKey, index) => (
                <th key={index} style={{ padding: '12px', color: '#334155' }}>{index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr><td colSpan={questionKeys.length + 2} style={{ padding: '30px', color: '#94a3b8' }}>Đang chờ học viên trả lời...</td></tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '700', color: '#003366' }}>
                    {showNames ? sub.id : '••••••••'}
                  </td>
                  <td style={{ padding: '12px 15px', color: '#10b981', fontWeight: 'bold' }}>100%</td>
                  {questionKeys.map((qKey, index) => {
                    const ansText = sub.answers ? sub.answers[qKey] : '';
                    return (
                      <td key={index} style={{ padding: '12px', fontWeight: '600', color: '#334155' }}>
                        {showResponses ? ansText : '✔'}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}