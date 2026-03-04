// src/pages/teacher/RoomManager.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function RoomManager() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho việc tạo phòng mới
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // States cho Roster Modal (Quản lý học viên)
  const [rosterRoom, setRosterRoom] = useState(null);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', studentId: '' });

  // DỮ LIỆU ĐƯỢC TRÍCH XUẤT TỪ FILE bagr903_roster.csv
  const fullRosterBAGR903 = [
    { lastName: "Nguyen", firstName: "Phu", studentId: "PHU180711" },
    { lastName: "Ma", firstName: "Huy", studentId: "HUY071111" },
    { lastName: "Nguyen", firstName: "Anh", studentId: "ANH220511" },
    { lastName: "Dang", firstName: "Son", studentId: "SON220711" },
    { lastName: "Nguyen", firstName: "Janah", studentId: "JANAH130512" },
    { lastName: "Tran", firstName: "Khanh", studentId: "KHANH020911" },
    { lastName: "Tran", firstName: "Alex", studentId: "ALEX300711" },
    { lastName: "Huynh", firstName: "Hoang", studentId: "HOANG271011" },
    { lastName: "Nguyen", firstName: "Thanh", studentId: "THANH111011" },
    { lastName: "Nguyen", firstName: "Nhu", studentId: "NHU100411" },
    { lastName: "Nguyen", firstName: "My", studentId: "MY010411" },
    { lastName: "Nguyen", firstName: "Duncan", studentId: "DUNCAN220811" },
    { lastName: "Banh", firstName: "Phillip", studentId: "PHILLIP291012" },
    { lastName: "Pham", firstName: "Thy", studentId: "THY281211" },
    { lastName: "Do", firstName: "Quang", studentId: "QUANG140811" },
    { lastName: "Nguyen", firstName: "Hoa", studentId: "HOA011211" },
    { lastName: "Le", firstName: "Duy", studentId: "DUY310511" },
    { lastName: "Huynh", firstName: "Sheddie", studentId: "SHEDDIE130511" },
    { lastName: "Nguyen", firstName: "Cici", studentId: "CICI111111" },
    { lastName: "Nguyen", firstName: "Ginnie", studentId: "GINNIE171211" },
    { lastName: "Do", firstName: "Tony", studentId: "TONY120311" }
  ];

  // 1. FETCH DỮ LIỆU TỪ FIREBASE
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rooms"));
      const roomsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomsData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. THÊM PHÒNG THỦ CÔNG
  const handleAddRoom = async () => {
    const roomNameUpper = newRoomName.trim().toUpperCase();
    if (!roomNameUpper) return;
    
    if (rooms.some(r => r.roomId === roomNameUpper)) {
      alert("Tên phòng đã tồn tại!");
      return;
    }

    try {
      const newRoom = {
        roomId: roomNameUpper,
        createdAt: new Date().toISOString(),
        students: []
      };
      await setDoc(doc(db, "rooms", roomNameUpper), newRoom);
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setIsAddingRoom(false);
    } catch (error) {
      console.error("Lỗi tạo phòng:", error);
    }
  };

  // 3. TẠO NHANH PHÒNG BAGR903 (KÈM 21 HỌC VIÊN TỪ FILE)
  const handleCreateRoomBAGR903 = async () => {
    try {
      const newRoom = {
        roomId: "BAGR903",
        createdAt: new Date().toISOString(),
        students: fullRosterBAGR903
      };
      // Lưu vào Firestore
      await setDoc(doc(db, "rooms", "BAGR903"), newRoom);
      
      // Cập nhật lại State UI
      if (!rooms.some(r => r.roomId === "BAGR903")) {
        setRooms([...rooms, newRoom]);
      } else {
        setRooms(rooms.map(r => r.roomId === "BAGR903" ? newRoom : r));
      }
      alert("Đã tạo phòng BAGR903 và Import thành công 21 học viên!");
    } catch (error) {
      console.error("Lỗi tạo phòng BAGR903:", error);
      alert("Có lỗi xảy ra khi tạo phòng.");
    }
  };

  // 4. XÓA PHÒNG
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ${roomId}? Mọi dữ liệu học viên sẽ bị mất.`)) {
      try {
        await deleteDoc(doc(db, "rooms", roomId));
        setRooms(rooms.filter(r => r.roomId !== roomId));
      } catch (error) {
        console.error("Lỗi xóa phòng:", error);
      }
    }
  };

  // 5. QUẢN LÝ ROSTER (THÊM/XÓA HỌC VIÊN LẺ)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.studentId.trim() || !newStudent.lastName.trim() || !newStudent.firstName.trim()) return;

    const updatedStudents = [...(rosterRoom.students || []), newStudent];
    try {
      await updateDoc(doc(db, "rooms", rosterRoom.roomId), { students: updatedStudents });
      setRosterRoom({ ...rosterRoom, students: updatedStudents });
      setRooms(rooms.map(r => r.roomId === rosterRoom.roomId ? { ...r, students: updatedStudents } : r));
      setNewStudent({ firstName: '', lastName: '', studentId: '' });
    } catch (error) {
      console.error("Lỗi thêm học viên:", error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const updatedStudents = rosterRoom.students.filter(s => s.studentId !== studentId);
    try {
      await updateDoc(doc(db, "rooms", rosterRoom.roomId), { students: updatedStudents });
      setRosterRoom({ ...rosterRoom, students: updatedStudents });
      setRooms(rooms.map(r => r.roomId === rosterRoom.roomId ? { ...r, students: updatedStudents } : r));
    } catch (error) {
      console.error("Lỗi xóa học viên:", error);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#003366', fontWeight: '800', margin: 0 }}>Rooms</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Quản lý phòng thi và danh sách học viên.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Button variant="success" style={{ width: 'auto', backgroundColor: '#e67e22' }} onClick={handleCreateRoomBAGR903}>
            ⚡ Khởi tạo nhanh phòng BAGR903
          </Button>
          <Button variant="primary" style={{ width: 'auto' }} onClick={() => setIsAddingRoom(true)}>
            + Add Room
          </Button>
        </div>
      </div>

      {/* BOX THÊM PHÒNG */}
      {isAddingRoom && (
        <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ flex: 1 }}>
            <Input 
              label="Room Name (Mã phòng)" 
              placeholder="Nhập tên phòng..." 
              value={newRoomName} 
              onChange={(e) => setNewRoomName(e.target.value.toUpperCase())} 
            />
          </div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <Button variant="success" onClick={handleAddRoom} style={{ width: 'auto', padding: '12px 20px' }}>Save</Button>
            <Button variant="danger" onClick={() => setIsAddingRoom(false)} style={{ width: 'auto', padding: '12px 20px', backgroundColor: '#94a3b8', boxShadow: 'none' }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* DANH SÁCH PHÒNG */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Đang tải danh sách phòng...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '700' }}>Room Name</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '700', textAlign: 'center' }}>Roster</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '700', textAlign: 'center' }}>Share</th>
                <th style={{ padding: '15px 20px', color: '#475569', fontWeight: '700', textAlign: 'center' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có phòng nào. Hãy tạo phòng mới!</td></tr>
              ) : (
                rooms.map(room => (
                  <tr key={room.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '15px 20px', color: '#003366', fontWeight: '700', fontSize: '18px' }}>
                      {room.roomId}
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setRosterRoom(room)}
                        style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 15px', cursor: 'pointer', color: '#003366', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: "'Josefin Sans', sans-serif" }}
                      >
                        👥 {room.students?.length || 0}
                      </button>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Chia sẻ">🔗</button>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteRoom(room.roomId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#dc2626' }} title="Xóa phòng">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL QUẢN LÝ ROSTER */}
      {rosterRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 51, 102, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Header Modal */}
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, color: '#003366', fontWeight: '800' }}>Roster: {rosterRoom.roomId}</h2>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Tổng số: {rosterRoom.students?.length || 0} học viên</span>
              </div>
              <button onClick={() => setRosterRoom(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✖</button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}><Input label="Last Name (Họ)" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} required /></div>
                <div style={{ flex: 1 }}><Input label="First Name (Tên)" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} required /></div>
                <div style={{ flex: 1 }}><Input label="Student ID (Mã HV)" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value.toUpperCase()})} required /></div>
                <div style={{ marginBottom: '20px' }}><Button type="submit" variant="success" style={{ width: 'auto', padding: '12px 20px', backgroundColor: '#003366' }}>Add</Button></div>
              </form>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px', fontWeight: '700' }}>Last Name</th>
                    <th style={{ padding: '12px', fontWeight: '700' }}>First Name</th>
                    <th style={{ padding: '12px', fontWeight: '700' }}>Student ID</th>
                    <th style={{ padding: '12px', fontWeight: '700', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(rosterRoom.students || []).length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Chưa có học viên nào trong Roster.</td></tr>
                  ) : (
                    rosterRoom.students.map((student, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', color: '#334155', fontWeight: '600' }}>{student.lastName}</td>
                        <td style={{ padding: '12px', color: '#334155', fontWeight: '600' }}>{student.firstName}</td>
                        <td style={{ padding: '12px', color: '#e67e22', fontWeight: '700' }}>{student.studentId}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteStudent(student.studentId)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}