import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';

export default function Launch() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [mode, setMode] = useState('Instant Feedback');

  useEffect(() => {
    const fetchData = async () => {
      const qSnap = await getDocs(collection(db, "quizzes"));
      setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const rSnap = await getDocs(collection(db, "rooms"));
      setRooms(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const handleLaunch = async () => {
    if (!selectedQuiz || !selectedRoom) {
      alert("Vui lòng chọn bài tập và phòng học!");
      return;
    }
    try {
      // Cập nhật trạng thái phòng thành đang có hoạt động (Session Endpoint)
      await updateDoc(doc(db, "rooms", selectedRoom), {
        activeSession: {
          quizId: selectedQuiz,
          mode: mode,
          status: 'active',
          startTime: new Date().toISOString()
        }
      });
      alert("Đã khởi chạy bài tập thành công!");
      navigate('/teacher/live');
    } catch (error) {
      console.error("Lỗi khi khởi chạy:", error);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#003366', fontWeight: '800', marginBottom: '30px' }}>Khởi chạy hoạt động (Launch)</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '10px' }}>Chọn bài tập (Library):</label>
          <select value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <option value="">-- Chọn Quiz --</option>
            {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '10px' }}>Chọn phòng (Room):</label>
          <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <option value="">-- Chọn Phòng --</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ fontWeight: '700', color: '#334155', display: 'block', marginBottom: '10px' }}>Chế độ làm bài:</label>
        <div style={{ display: 'flex', gap: '15px' }}>
          {['Instant Feedback', 'Open Navigation', 'Teacher Paced'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
              {m}
            </label>
          ))}
        </div>
      </div>

      <Button variant="success" onClick={handleLaunch}>🚀 Kích hoạt ngay</Button>
    </div>
  );
}