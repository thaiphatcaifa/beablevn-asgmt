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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dateStr = new Date(report.date).toLocaleString('vi-VN');
  
  // Tính toán thống kê
  const totalParticipated = report.submissions?.length || 0;
  const totalStudents = report.roster?.length || report.totalStudents || 1;
  const completionRate = Math.round((totalParticipated / totalStudents) * 100) || 0;
  const avgScore = totalParticipated > 0 ? 85 : 0; 
  const passRate = totalParticipated > 0 ? 90 : 0; 

  const questionKeys = report.submissions && report.submissions[0] && report.submissions[0].answers 
    ? Object.keys(report.submissions[0].answers).sort() 
    : ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];

  return (
    <div style={{ padding: isMobile ? '15px' : '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER DETAIL */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '30px', gap: '15px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '10px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
            ← Back to Reports
          </button>
          <h2 style={{ color: '#003366', margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '800', textTransform: 'uppercase', lineHeight: '1.3' }}>{report.name}</h2>
          <p style={{ color: '#64748b', margin: '8px 0 0 0', fontWeight: '500', fontSize: '14px' }}>Date: {dateStr} • Room: <span style={{ color: '#003366', fontWeight: '700' }}>{report.room}</span></p>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
          <button style={{ width: isMobile ? '100%' : 'auto', backgroundColor: 'white', color: '#003366', border: '2px solid #003366', padding: '10px 15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: isMobile ? '13px' : '14px' }}>
            ✉ Email
          </button>
          <button style={{ width: isMobile ? '100%' : 'auto', backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)', fontSize: isMobile ? '13px' : '14px', whiteSpace: 'nowrap' }}>
            ⬇ Export
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        {[
          { label: 'Participated', val: `${totalParticipated} / ${totalStudents}` },
          { label: 'Completion %', val: `${completionRate}%` },
          { label: 'Average Score', val: `${avgScore}%` },
          { label: 'Pass Rate', val: `${passRate}%` }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: isMobile ? '16px' : '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.5px' }}>{stat.label}</div>
            <div style={{ color: '#003366', fontSize: isMobile ? '24px' : '32px', fontWeight: '800' }}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* TOGGLES */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', padding: '0 5px' }}>
        <Toggle label="Show Names" checked={showNames} onChange={setShowNames} />
        <Toggle label="Show Responses" checked={showResponses} onChange={setShowResponses} />
        <Toggle label="Show Results" checked={showResults} onChange={setShowResults} />
      </div>

      {/* RESPONSE MATRIX */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
            <tr>
              <th style={{ padding: '16px 20px', textAlign: 'left', color: '#475569', width: '200px', position: 'sticky', left: 0, backgroundColor: '#f1f5f9', zIndex: 10 }}>Name</th>
              <th style={{ padding: '16px', color: '#475569', width: '80px' }}>Score</th>
              {questionKeys.map((q, i) => <th key={i} style={{ padding: '16px', color: '#003366', fontWeight: '800' }}>{i + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {(!report.roster || report.roster.length === 0) ? (
              <tr><td colSpan={questionKeys.length + 2} style={{ padding: '40px', color: '#94a3b8' }}>Không có dữ liệu học viên.</td></tr>
            ) : (
              report.roster.map((student, idx) => {
                const sub = (report.submissions || []).find(s => s.id === student.studentId || s.studentId === student.studentId);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#003366', position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 5, borderRight: '1px solid #f1f5f9' }}>
                      {showNames ? `${student.lastName} ${student.firstName}` : '••••••••'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', color: sub ? '#10b981' : '#94a3b8' }}>
                      {sub ? '85%' : '-'}
                    </td>
                    {questionKeys.map((q, qIdx) => {
                      const ans = sub?.answers ? sub.answers[q] : null;
                      const isCorrect = Math.random() > 0.3; // Giả lập
                      let bg = 'transparent', color = '#334155', text = showResponses ? (ans || '') : '✓';
                      if (!sub) text = '';
                      else if (showResults && ans) {
                        bg = isCorrect ? '#dcfce7' : '#fee2e2';
                        color = isCorrect ? '#15803d' : '#b91c1c';
                      }
                      return (
                        <td key={qIdx} style={{ padding: '10px' }}>
                          <div style={{ backgroundColor: bg, color, padding: '8px', borderRadius: '8px', fontWeight: '700', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: sub && !showResults ? '1px solid #e2e8f0' : 'none' }}>{text}</div>
                        </td>
                      );
                    })}
                  </tr>
                )
              })
            )}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dữ liệu từ Firebase
  const fetchReports = async () => {
    try {
      const snap = await getDocs(collection(db, "reports"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  const uniqueRooms = ['All Rooms', ...new Set(reports.map(r => r.room))];

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedReports(filteredReports.map(r => r.id));
    else setSelectedReports([]);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedReports.length} báo cáo này?`)) return;
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

  if (viewingReport) {
    return <ReportDetailView report={viewingReport} onBack={() => setViewingReport(null)} />;
  }

  // --- RENDER DANH SÁCH REPORT (TABLE VIEW) ---
  return (
    <div style={{ padding: isMobile ? '15px' : '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ color: '#003366', margin: '0 0 24px 0', fontSize: isMobile ? '24px' : '28px', fontWeight: '800' }}>Reports</h2>
      
      {/* TOOLBAR: Search, Filter & Actions (Mobile xếp dọc) */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: '24px', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', minWidth: isMobile ? '0' : '220px', outlineColor: '#003366', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <select 
            value={roomFilter} 
            onChange={(e) => setRoomFilter(e.target.value)}
            style={{ width: isMobile ? '100%' : 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#003366', color: '#003366', fontWeight: '700', fontSize: '14px', cursor: 'pointer', backgroundColor: 'white' }}
          >
            {uniqueRooms.map(room => <option key={room} value={room}>{room}</option>)}
          </select>
        </div>

        {selectedReports.length > 0 && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
            <button style={{ width: isMobile ? '100%' : 'auto', backgroundColor: 'white', color: '#003366', border: '2px solid #003366', padding: '10px 15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Archive
            </button>
            <button onClick={handleDelete} style={{ width: isMobile ? '100%' : 'auto', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* TABLE VIEW */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', width: '60px', textAlign: 'center' }}>
                <input type="checkbox" checked={selectedReports.length > 0 && selectedReports.length === filteredReports.length} onChange={handleSelectAll} style={{ accentColor: '#003366', cursor: 'pointer', width: '16px', height: '16px' }} />
              </th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Không tìm thấy báo cáo nào.</td></tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)} 
                      onChange={() => setSelectedReports(prev => prev.includes(report.id) ? prev.filter(id => id !== report.id) : [...prev, report.id])} 
                      style={{ accentColor: '#003366', cursor: 'pointer', width: '16px', height: '16px' }} 
                    />
                  </td>
                  <td onClick={() => setViewingReport(report)} style={{ padding: '16px 20px', color: '#003366', fontWeight: '800', cursor: 'pointer' }}>
                    <span style={{ borderBottom: '1px dashed #003366' }}>{report.name}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontWeight: '500' }}>{new Date(report.date).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '16px 20px', color: '#334155', fontWeight: '700' }}>{report.room}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>
                    <span style={{ backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>{report.type}</span>
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