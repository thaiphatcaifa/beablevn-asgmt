// src/pages/teacher/TeacherDashboard.jsx
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

  // Lấy danh sách Rooms từ Firebase theo thời gian thực để dropdown luôn cập nhật
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ưu tiên hiển thị các room được chọn inMenu
      const menuRooms = roomData.filter(r => r.inMenu !== false).sort((a, b) => a.id.localeCompare(b.id));
      setRooms(menuRooms);
      
      // Mặc định chọn phòng đầu tiên nếu chưa có phòng nào được chọn
      if (menuRooms.length > 0 && !activeRoom) {
        setActiveRoom(menuRooms[0].id); 
      }
    });
    return () => unsubscribe();
  }, [activeRoom]);

  // Style cho thanh Navigation
  const navItemStyle = (path) => {
    const isActive = location.pathname === path || (path !== '/teacher' && location.pathname.startsWith(path));
    return {
      color: isActive ? '#003366' : '#64748b',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '15px',
      padding: '10px 16px',
      borderRadius: '8px',
      backgroundColor: isActive ? '#f1f5f9' : 'transparent',
      transition: 'all 0.2s ease',
      display: 'inline-block'
    };
  };

  return (
    <TeacherContext.Provider value={{ activeRoom, setActiveRoom }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
        
        {/* HEADER & NAVIGATION */}
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/BA LOGO.png" alt="Logo" style={{ height: '36px' }} />
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#003366', letterSpacing: '0.5px' }}>BE ABLE VN</span>
            </div>
            
            <nav style={{ display: 'flex', gap: '8px' }}>
              <Link to="/teacher" style={navItemStyle('/teacher')}>Launch</Link>
              <Link to="/teacher/exercises" style={navItemStyle('/teacher/exercises')}>Library</Link>
              <Link to="/teacher/rooms" style={navItemStyle('/teacher/rooms')}>Rooms</Link>
              <Link to="/teacher/live" style={navItemStyle('/teacher/live')}>Live Results</Link>
              <Link to="/teacher/reports" style={navItemStyle('/teacher/reports')}>Reports</Link>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Bộ chọn Room dùng chung cho toàn hệ thống Teacher */}
            <select 
              value={activeRoom} 
              onChange={(e) => setActiveRoom(e.target.value)} 
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#003366', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '14px' }}
            >
              {rooms.length === 0 && <option value="">No Rooms Available</option>}
              {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
            </select>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
            <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Log Out</Link>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (CÁC TABS) */}
        <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Launch />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="exercises/new" element={<CreateExercise />} />
            <Route path="exercises/:quizId" element={<CreateExercise />} />
            <Route path="exercises" element={<ExerciseLibrary />} />
            <Route path="reports" element={<Reports />} />
            <Route path="live" element={<LiveResults />} />
          </Routes>
        </main>
      </div>
    </TeacherContext.Provider>
  );
}