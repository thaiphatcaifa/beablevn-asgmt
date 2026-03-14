import { useState, useEffect, createContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import RoomManager from './RoomManager';
import ExerciseLibrary from './ExerciseLibrary';
import CreateExercise from './CreateExercise';
import Reports from './Reports';
import Launch from './Launch';
import LiveResults from './LiveResults';

// Tạo Context để share trạng thái Room cho các Tabs
export const TeacherContext = createContext();

export default function TeacherDashboard() {
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState('');

  // Lấy danh sách Rooms từ Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomData);
      if (roomData.length > 0 && !activeRoom) {
        setActiveRoom(roomData[0].id); // Mặc định chọn phòng đầu tiên
      }
    });
    return () => unsubscribe();
  }, [activeRoom]);

  const navItemStyle = (path) => {
    const isActive = location.pathname === path || (path !== '/teacher' && location.pathname.startsWith(path));
    return {
      color: isActive ? '#003366' : '#94a3b8', 
      textDecoration: 'none',
      fontWeight: isActive ? '700' : '600',
      fontSize: '15px',
      padding: '15px 20px',
      borderBottom: isActive ? '3px solid #003366' : '3px solid transparent',
      transition: 'all 0.2s',
    };
  };

  return (
    <TeacherContext.Provider value={{ activeRoom, setActiveRoom, rooms }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <Link to="/teacher" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/BA LOGO.png" alt="BeAble" style={{ height: '35px' }} />
              <span style={{ fontWeight: '800', color: '#003366', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Assignment</span>
            </Link>
            <nav style={{ display: 'flex', gap: '5px', height: '100%' }}>
              <Link to="/teacher" style={navItemStyle('/teacher')}>Launch</Link>
              <Link to="/teacher/exercises" style={navItemStyle('/teacher/exercises')}>Library</Link>
              <Link to="/teacher/rooms" style={navItemStyle('/teacher/rooms')}>Rooms</Link>
              <Link to="/teacher/live" style={navItemStyle('/teacher/live')}>Live Results</Link>
              <Link to="/teacher/reports" style={navItemStyle('/teacher/reports')}>Reports</Link>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <select 
              value={activeRoom} 
              onChange={(e) => setActiveRoom(e.target.value)} 
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#003366', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc' }}
            >
              {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
            </select>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>Log Out</Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
    </TeacherContext.Provider>
  );
}