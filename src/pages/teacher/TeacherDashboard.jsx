import { Routes, Route, Link } from 'react-router-dom';
import RoomManager from './RoomManager';
import ExerciseLibrary from './ExerciseLibrary';

export default function TeacherDashboard() {
  const linkStyle = { textDecoration: 'none', color: '#333', fontWeight: 'bold' };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#f8f9fa', borderRight: '1px solid #ddd', padding: '20px' }}>
        <h2 style={{ color: '#007bff' }}>Giáo viên</h2>
        <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '2.5' }}>
          <li><Link to="/teacher" style={linkStyle}>🏠 Tổng quan</Link></li>
          <li><Link to="/teacher/rooms" style={linkStyle}>🏫 Quản lý Phòng</Link></li>
          <li><Link to="/teacher/exercises" style={linkStyle}>📚 Thư viện Bài tập</Link></li>
          <li><Link to="/" style={{...linkStyle, color: 'red'}}>🚪 Đăng xuất</Link></li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<h2>Chào mừng đến với Bảng điều khiển Giáo viên</h2>} />
          <Route path="rooms" element={<RoomManager />} />
          <Route path="exercises" element={<ExerciseLibrary />} />
        </Routes>
      </div>
    </div>
  );
}