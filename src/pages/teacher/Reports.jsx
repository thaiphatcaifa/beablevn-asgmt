// src/pages/teacher/Reports.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// --- COMPONENT: TOGGLE SWITCH ---
const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onChange(!checked)}>
    <div style={{ width: '36px', height: '20px', borderRadius: '10px', backgroundColor: checked ? '#003366' : '#cbd5e1', position: 'relative', transition: 'all 0.2s' }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: checked ? '18px' : '2px', transition: 'all 0.2s' }} />
    </div>
    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600' }}>{label}</span>
  </div>
);

// --- COMPONENT: REPORT DETAIL VIEW ---
const ReportDetailView = ({ report, onBack }) => {
  const [showNames, setShowNames] = useState(true);
  const [showResponses, setShowResponses] = useState(true);
  const [showResults, setShowResults] = useState(true);

  const dateStr = new Date(report.date).toLocaleString('vi-VN');
  
  // Tính toán thống kê giả lập từ dữ liệu
  const totalParticipated = report.submissions?.length || 0;
  const totalStudents = report.roster?.length || report.totalStudents || 1;
  const completionRate = Math.round((totalParticipated / totalStudents) * 100) || 0;
  const avgScore = totalParticipated > 0 ? 85 : 0; // Giả lập 85%
  const passRate = totalParticipated > 0 ? 90 : 0; // Giả lập 90%

  const questionKeys = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']; // Cấu trúc giả định

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER DETAIL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← Back to Reports
          </button>
          <h2 style={{ color: '#003366', margin: 0, fontSize: '24px', fontWeight: '800' }}>{report.name}</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0 0', fontWeight: '500' }}>{dateStr} • Room: {report.room}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ backgroundColor: 'white', color: '#003366', border: '1px solid #003366', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            ✉ Email Results to Students
          </button>
          <button style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
            ⬇ Export Results
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {[
          { label: 'Total Participated', val: `${totalParticipated} / ${totalStudents}` },
          { label: 'Completion', val: `${completionRate}%` },
          { label: 'Average Score', val: `${avgScore}%` },
          { label: 'Pass Rate', val: `${passRate}%` }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ color: '#003366', fontSize: '28px', fontWeight: '800' }}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* TOGGLES */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
        <Toggle label="Show Names" checked={showNames} onChange={setShowNames} />
        <Toggle label="Show Responses" checked={showResponses} onChange={setShowResponses} />
        <Toggle label="Show Results" checked={showResults} onChange={setShowResults} />
      </div>

      {/* RESPONSE MATRIX */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Name</th>
              <th style={{ padding: '16px', color: '#475569' }}>Score</th>
              {questionKeys.map(q => <th key={q} style={{ padding: '16px', color: '#003366' }}>{q}</th>)}
            </tr>
          </thead>
          <tbody>
            {(report.roster || []).map((student, idx) => {
              const sub = (report.submissions || []).find(s => s.id === student.studentId || s.studentId === student.studentId);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#003366' }}>
                    {showNames ? `${student.lastName} ${student.firstName}` : '••••••••'}
                  </td>
                  <td style={{ padding: '16px', fontWeight: '700', color: sub ? '#10b981' : '#94a3b8' }}>
                    {sub ? '85%' : '-'}
                  </td>
                  {questionKeys.map((q, qIdx) => {
                    const ans = sub?.answers ? sub.answers[q] : null;
                    const isCorrect = Math.random() > 0.3; // Giả lập
                    let bg = 'transparent', color = '#334155', text = showResponses ? (ans || '') : '✓';
                    if (!sub) text = '';
                    else if (showResults) {
                      bg = isCorrect ? '#dcfce7' : '#fee2e2';
                      color = isCorrect ? '#15803d' : '#b91c1c';
                    }
                    return (
                      <td key={qIdx} style={{ padding: '12px' }}>
                        <div style={{ backgroundColor: bg, color, padding: '8px', borderRadius: '6px', fontWeight: '600' }}>{text}</div>
                      </td>
                    );
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- TRANG CHÍNH: REPORTS ---
export default function Reports() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [selectedReports, setSelectedReports] = useState([]);
  const [viewingReport, setViewingReport] = useState(null);

  // Fetch dữ liệu từ Firebase
  const fetchReports = async () => {
    try {
      const snap = await getDocs(collection(db, "reports"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort mới nhất lên đầu
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReports(data);
    } catch (error) {
      console.error("Lỗi lấy báo cáo:", error);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // Lọc dữ liệu
  const filteredReports = reports.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRoom = roomFilter === 'All Rooms' || r.room === roomFilter;
    return matchSearch && matchRoom;
  });

  // Lấy danh sách Room duy nhất cho bộ lọc
  const uniqueRooms = ['All Rooms', ...new Set(reports.map(r => r.room))];

  // Chức năng Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedReports(filteredReports.map(r => r.id));
    else setSelectedReports([]);
  };

  // Xóa báo cáo
  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedReports.length} báo cáo này?`)) return;
    try {
      for (let id of selectedReports) {
        await deleteDoc(doc(db, "reports", id));
      }
      setReports(reports.filter(r => !selectedReports.includes(r.id)));
      setSelectedReports([]);
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  // Nếu đang xem chi tiết, hiển thị Component Detail
  if (viewingReport) {
    return <ReportDetailView report={viewingReport} onBack={() => setViewingReport(null)} />;
  }

  // --- RENDER DANH SÁCH REPORT (TABLE VIEW) ---
  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ color: '#003366', margin: '0 0 20px 0', fontSize: '28px', fontWeight: '800' }}>Reports</h2>
      
      {/* TOOLBAR: Search, Filter & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search reports..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px', outlineColor: '#003366' }}
          />
          <select 
            value={roomFilter} 
            onChange={(e) => setRoomFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#003366', color: '#334155', fontWeight: '600' }}
          >
            {uniqueRooms.map(room => <option key={room} value={room}>{room}</option>)}
          </select>
        </div>

        {selectedReports.length > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ backgroundColor: 'white', color: '#003366', border: '1px solid #003366', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Archive
            </button>
            <button onClick={handleDelete} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* TABLE VIEW */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
            <tr>
              <th style={{ padding: '16px', width: '50px', textAlign: 'center' }}>
                <input type="checkbox" checked={selectedReports.length > 0 && selectedReports.length === filteredReports.length} onChange={handleSelectAll} style={{ accentColor: '#003366', transform: 'scale(1.2)' }} />
              </th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Name</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Date</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Room</th>
              <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy báo cáo nào.</td></tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)} 
                      onChange={() => setSelectedReports(prev => prev.includes(report.id) ? prev.filter(id => id !== report.id) : [...prev, report.id])} 
                      style={{ accentColor: '#003366', transform: 'scale(1.2)' }} 
                    />
                  </td>
                  <td onClick={() => setViewingReport(report)} style={{ padding: '16px', color: '#003366', fontWeight: '800', cursor: 'pointer' }}>
                    <span style={{ borderBottom: '1px dashed #003366' }}>{report.name}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{new Date(report.date).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '16px', color: '#334155', fontWeight: '700' }}>{report.room}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    <span style={{ backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>{report.type}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}