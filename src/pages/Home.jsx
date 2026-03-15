// src/pages/Home.jsx
import { Link } from 'react-router-dom';

// --- HỆ THỐNG SVG ICONS TỐI GIẢN (Nét mảnh, màu #003366) ---
const SvgIcons = {
  Student: () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
  ),
  Teacher: () => (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  )
};

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc', 
      padding: '20px', 
      fontFamily: "'Josefin Sans', sans-serif" 
    }}>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px 30px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', 
        width: '100%', 
        maxWidth: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        
        {/* LOGO & TITLE */}
        <img 
          src="/BA LOGO.png" 
          alt="BE ABLE VN Logo" 
          style={{ height: '70px', objectFit: 'contain', marginBottom: '24px' }} 
        />
        <h1 style={{ color: '#003366', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '1px', textAlign: 'center' }}>
          BE ABLE VN
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 40px 0', textAlign: 'center', fontWeight: '500' }}>
          Hệ thống Quản lý Bài tập & Đánh giá
        </p>
        
        {/* BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Link to="/student/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button 
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', 
                backgroundColor: '#003366', color: 'white', fontSize: '16px', fontWeight: '700', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' 
              }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <SvgIcons.Student /> Học viên đăng nhập
            </button>
          </Link>
          
          <Link to="/teacher/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button 
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #003366', 
                backgroundColor: 'white', color: '#003366', fontSize: '16px', fontWeight: '700', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
                cursor: 'pointer', transition: 'all 0.2s' 
              }} 
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }} 
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <SvgIcons.Teacher /> Giáo viên đăng nhập
            </button>
          </Link>
        </div>

      </div>
      
    </div>
  );
}