// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
         <img 
           src="/BA LOGO.png" 
           alt="BeAble Logo" 
           style={{ height: '50px', objectFit: 'contain' }} 
         />
      </header>

      <div className="home-content">
        <h1 className="home-title">BE ABLE VN</h1>
        <p className="home-subtitle">Hệ thống Quản lý Bài tập & Đánh giá</p>
        
        <div className="button-group">
          <Link to="/teacher/login" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button variant="primary" className="role-btn">👨‍🏫 Giáo viên</Button>
          </Link>
          <Link to="/student/login" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button variant="success" className="role-btn">👨‍🎓 Học viên</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}