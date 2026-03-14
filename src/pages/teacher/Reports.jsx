import { useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TeacherContext } from './TeacherDashboard';

export default function Reports() {
  const { activeRoom } = useContext(TeacherContext);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, "reports"));
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Xóa vĩnh viễn báo cáo này?")) {
      await deleteDoc(doc(db, "reports", id));
      setReports(reports.filter(r => r.id !== id));
    }
  };

  // Chỉ hiển thị reports của Room đang chọn
  const filteredReports = reports.filter(r => r.room === activeRoom);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ color: '#003366', margin: '0 0 20px 0', fontSize: '24px' }}>Reports - Lớp {activeRoom}</h2>
      
      {isLoading ? <div style={{ padding: '20px', color: '#94a3b8' }}>Đang tải...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '15px' }}>Quiz Title</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Mode</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có báo cáo nào cho lớp này.</td></tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px', color: '#003366', fontWeight: 'bold' }}>{report.quizTitle}</td>
                  <td style={{ padding: '15px', color: '#64748b' }}>{new Date(report.date).toLocaleString()}</td>
                  <td style={{ padding: '15px', color: '#64748b' }}>{report.mode}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(report.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}