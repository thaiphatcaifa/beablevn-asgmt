import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RoomManager from './RoomManager';
import ExerciseLibrary from './ExerciseLibrary';
import CreateExercise from './CreateExercise';
import Reports from './Reports';
import Launch from './Launch';
import LiveResults from './LiveResults';

export default function TeacherDashboard() {
  const location = useLocation();

  const navItemStyle = (path) => {
    const isActive = location.pathname === path || (path !== '/teacher' && location.pathname.startsWith(path));
    return {
      color: isActive ? '#003366' : '#94a3b8', 
      textDecoration: 'none',
      fontWeight: isActive ? '700' : '600',
      fontSize: '16px',
      padding: '15px 20px',
      borderBottom: isActive ? '3px solid #003366' : '3px solid transparent',
      transition: 'all 0.3s',
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* TOP NAVIGATION BAR */}
      <header style={{ backgroundColor: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link to="/teacher" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/BA LOGO.png" alt="BeAble Logo" style={{ height: '40px' }} />
            <span style={{ fontWeight: '800', color: '#003366', fontSize: '1.2rem' }}>Assignment</span>
          </Link>
          <nav style={{ display: 'flex', gap: '5px', height: '100%' }}>
            <Link to="/teacher" style={navItemStyle('/teacher')}>Launch</Link>
            <Link to="/teacher/exercises" style={navItemStyle('/teacher/exercises')}>Library</Link>
            <Link to="/teacher/rooms" style={navItemStyle('/teacher/rooms')}>Rooms</Link>
            <Link to="/teacher/live" style={navItemStyle('/teacher/live')}>Live Results</Link>
            <Link to="/teacher/reports" style={navItemStyle('/teacher/reports')}>Reports</Link>
          </nav>
        </div>
        
        {/* SYSTEM STATUS AREA & ROOM SELECTOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            3 of 21
          </div>
          <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: '700', color: '#003366', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc' }}>
            <option value="BAGR903">BAGR903</option>
            <option value="MATH101">MATH101</option>
            <option value="ENG202">ENG202</option>
          </select>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
          <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', padding: '8px 15px', borderRadius: '8px', background: '#fef2f2' }}>Thoát</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Launch />} />
          <Route path="rooms" element={<RoomManager />} />
          <Route path="exercises/new" element={<CreateExercise />} />
          <Route path="exercises/:quizId" element={<CreateExercise />} />
          <Route path="exercises" element={<ExerciseLibrary />} />
          <Route path="live" element={<LiveResults />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}