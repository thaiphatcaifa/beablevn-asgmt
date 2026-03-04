import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function LiveResults() {
  const [submissions, setSubmissions] = useState([]);
  const [activeRoom, setActiveRoom] = useState('BAGR903'); // Demo room

  useEffect(() => {
    // Lắng nghe realtime từ subcollection 'submissions' của phòng đang active
    const q = query(collection(db, `rooms/${activeRoom}/submissions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
    });

    return () => unsubscribe();
  }, [activeRoom]);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#003366', margin: 0 }}>🔴 Live Results - {activeRoom}</h2>
        <span style={{ padding: '8px 15px', backgroundColor: '#e67e22', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
          Đang theo dõi
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '15px' }}>Học viên (ID)</th>
            <th style={{ padding: '15px' }}>Thời gian nộp</th>
            <th style={{ padding: '15px' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Chưa có học viên nộp bài...</td></tr>
          ) : (
            submissions.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#003366' }}>{sub.id}</td>
                <td style={{ padding: '15px' }}>{new Date(sub.submittedAt).toLocaleTimeString()}</td>
                <td style={{ padding: '15px', color: '#16a34a', fontWeight: 'bold' }}>Đã nộp ✔</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}