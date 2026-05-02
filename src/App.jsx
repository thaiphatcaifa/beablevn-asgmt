// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentLogin from './pages/student/StudentLogin';
import DoAssignment from './pages/student/DoAssignment';

// Hàng rào bảo vệ Route của Giáo viên
const ProtectedTeacherRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
  // Nếu chưa có cờ đăng nhập, tự động đá về trang /teacher/login
  return isAuthenticated ? children : <Navigate to="/teacher/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Routes của Giáo viên */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        
        {/* Áp dụng hàng rào bảo vệ cho toàn bộ Dashboard của giáo viên */}
        <Route 
          path="/teacher/*" 
          element={
            <ProtectedTeacherRoute>
              <TeacherDashboard />
            </ProtectedTeacherRoute>
          } 
        />
        
        {/* Routes của Học viên */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/room/:roomId" element={<DoAssignment />} />
      </Routes>
    </Router>
  );
}

export default App;