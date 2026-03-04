import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RoomManager from './RoomManager';
import ExerciseLibrary from './ExerciseLibrary';
import CreateExercise from './CreateExercise';
import Reports from './Reports';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <header style={{ backgroundColor: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/teacher" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/BA LOGO.png" alt="BeAble Logo" style={{ height: '40px' }} />
            <span style={{ fontWeight: '800', color: '#003366', fontSize: '1.2rem' }}>Assignment</span>
          </Link>
          <nav style={{ display: 'flex', gap: '5px', height: '100%' }}>
            <Link to="/teacher" style={navItemStyle('/teacher')}>Launch</Link>
            <Link to="/teacher/exercises" style={navItemStyle('/teacher/exercises')}>Quizzes</Link>
            <Link to="/teacher/rooms" style={navItemStyle('/teacher/rooms')}>Rooms</Link>
            <Link to="/teacher/reports" style={navItemStyle('/teacher/reports')}>Reports</Link>
          </nav>
        </div>
        <Link to="/" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '700', padding: '8px 15px', borderRadius: '8px', background: '#fef2f2' }}>Thoát</Link>
      </header>

      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={
            <div>
              <h2 style={{ color: '#003366', fontWeight: '800', marginBottom: '30px' }}>Launch</h2>
              <div style={{ display: 'flex', gap: '25px', marginTop: '20px' }}>
                <div style={{ padding: '50px', backgroundColor: '#003366', color: 'white', borderRadius: '16px', cursor: 'pointer', flex: 1, textAlign: 'center', fontSize: '22px', fontWeight: '700', boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)' }}>Quiz</div>
                <div style={{ padding: '50px', backgroundColor: '#e67e22', color: 'white', borderRadius: '16px', cursor: 'pointer', flex: 1, textAlign: 'center', fontSize: '22px', fontWeight: '700', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)' }}>Space Race</div>
                <div style={{ padding: '50px', backgroundColor: '#475569', color: 'white', borderRadius: '16px', cursor: 'pointer', flex: 1, textAlign: 'center', fontSize: '22px', fontWeight: '700', boxShadow: '0 4px 12px rgba(71, 85, 105, 0.2)' }}>Exit Ticket</div>
              </div>
            </div>
          } />
          <Route path="rooms" element={<RoomManager />} />
          <Route path="exercises/new" element={<CreateExercise />} />
          <Route path="exercises" element={<ExerciseLibrary />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}