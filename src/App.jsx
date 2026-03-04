import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentLogin from './pages/student/StudentLogin';
import DoAssignment from './pages/student/DoAssignment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Routes của Giáo viên */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        
        {/* Routes của Học viên */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/room/:roomId" element={<DoAssignment />} />
      </Routes>
    </Router>
  );
}

export default App;