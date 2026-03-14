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
  
  // States hỗ trợ Responsive & Mobile Menu
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lắng nghe kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false); // Tự động đóng menu mobile nếu phóng to màn hình
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Style cho thanh Navigation (Desktop)
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

  // Style cho thanh Navigation (Mobile)
  const mobileNavItemStyle = (path) => {
    const isActive = location.pathname === path || (path !== '/teacher' && location.pathname.startsWith(path));
    return {
      color: isActive ? '#003366' : '#64748b',
      textDecoration: 'none',
      fontWeight: '800',
      fontSize: '16px',
      padding: '14px 20px',
      borderRadius: '10px',
      backgroundColor: isActive ? '#f1f5f9' : 'transparent',
      transition: 'all 0.2s ease',
      display: 'block'
    };
  };

  return (
    <TeacherContext.Provider value={{ activeRoom, setActiveRoom }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
        
        {/* HEADER */}
        <header style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e2e8f0', 
          padding: isMobile ? '0 15px' : '0 40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '70px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '40px' }}>
            
            {/* Nút Hamburger Menu (Chỉ hiện trên Mobile) */}
            {isMobile && (
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#003366' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/BA LOGO.png" alt="Logo" style={{ height: '36px' }} />
              {!isMobile && <span style={{ fontSize: '20px', fontWeight: '800', color: '#003366', letterSpacing: '0.5px' }}>BE ABLE VN</span>}
            </div>
            
            {/* Navigation (Chỉ hiện trên Desktop) */}
            {!isMobile && (
              <nav style={{ display: 'flex', gap: '8px' }}>
                <Link to="/teacher" style={navItemStyle('/teacher')}>Launch</Link>
                <Link to="/teacher/exercises" style={navItemStyle('/teacher/exercises')}>Library</Link>
                <Link to="/teacher/rooms" style={navItemStyle('/teacher/rooms')}>Rooms</Link>
                <Link to="/teacher/live" style={navItemStyle('/teacher/live')}>Live Results</Link>
                <Link to="/teacher/reports" style={navItemStyle('/teacher/reports')}>Reports</Link>
              </nav>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px' }}>
            {/* Bộ chọn Room */}
            <select 
              value={activeRoom} 
              onChange={(e) => setActiveRoom(e.target.value)} 
              style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                fontWeight: '700', 
                color: '#003366', 
                outline: 'none', 
                cursor: 'pointer', 
                backgroundColor: '#f8fafc', 
                fontSize: '14px',
                maxWidth: isMobile ? '120px' : 'auto'
              }}
            >
              {rooms.length === 0 && <option value="">No Rooms</option>}
              {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
            </select>
            
            {/* Nút Log Out (Desktop) */}
            {!isMobile && (
              <>
                <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
                <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Log Out</Link>
              </>
            )}
          </div>
        </header>

        {/* --- MOBILE MENU SIDEBAR --- */}
        {isMobile && (
          <>
            {/* Lớp mờ (Overlay) khi mở menu */}
            <div 
              onClick={() => setIsMenuOpen(false)}
              style={{ 
                position: 'fixed', 
                top: '70px', 
                left: 0, 
                width: '100%', 
                height: 'calc(100vh - 70px)', 
                backgroundColor: 'rgba(15, 23, 42, 0.4)', 
                zIndex: 40, 
                backdropFilter: 'blur(2px)',
                opacity: isMenuOpen ? 1 : 0,
                visibility: isMenuOpen ? 'visible' : 'hidden',
                transition: 'all 0.3s ease'
              }} 
            />
            
            {/* Khung Sidebar trượt */}
            <div style={{
              position: 'fixed',
              top: '70px',
              left: isMenuOpen ? 0 : '-280px',
              width: '260px',
              height: 'calc(100vh - 70px)',
              backgroundColor: 'white',
              zIndex: 45,
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isMenuOpen ? '4px 0 15px rgba(0,0,0,0.05)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px'
            }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <Link to="/teacher" onClick={() => setIsMenuOpen(false)} style={mobileNavItemStyle('/teacher')}>Launch</Link>
                <Link to="/teacher/exercises" onClick={() => setIsMenuOpen(false)} style={mobileNavItemStyle('/teacher/exercises')}>Library</Link>
                <Link to="/teacher/rooms" onClick={() => setIsMenuOpen(false)} style={mobileNavItemStyle('/teacher/rooms')}>Rooms</Link>
                <Link to="/teacher/live" onClick={() => setIsMenuOpen(false)} style={mobileNavItemStyle('/teacher/live')}>Live Results</Link>
                <Link to="/teacher/reports" onClick={() => setIsMenuOpen(false)} style={mobileNavItemStyle('/teacher/reports')}>Reports</Link>
              </nav>
              
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: 'auto' }}>
                <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log Out
                </Link>
              </div>
            </div>
          </>
        )}

        {/* NỘI DUNG CHÍNH (CÁC TABS) */}
        <main style={{ flex: 1, padding: isMobile ? '20px 10px' : '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
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