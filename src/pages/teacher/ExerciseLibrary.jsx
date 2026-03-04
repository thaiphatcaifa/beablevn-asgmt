// src/pages/teacher/ExerciseLibrary.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // DỮ LIỆU ĐƯỢC TRÍCH XUẤT TỪ FILE PDF: BA25 GR9 VOCABULARY
  const quizBA25Data = {
    title: "BA25 GR9: VOCABULARY (Global Success)",
    createdAt: new Date().toISOString(),
    type: "Quiz",
    questions: [
      { id: 1, text: "Thailand promotes ______ tourism by holding festivals to showcase the authentic Thai dishes to foreign tourists.", options: ["sports", "shopping", "food", "culture"], correctOption: "food" },
      { id: 2, text: "When spending a week in Berlin, you can ______ the city itself and its surroundings.", options: ["explore", "travel", "visit", "guide"], correctOption: "explore" },
      { id: 3, text: "Homestays are popular with solo ______ who want to experience the local lifestyle.", options: ["shoppers", "agents", "hunters", "travellers"], correctOption: "travellers" },
      { id: 4, text: "Son Doong Cave is one of the most fascinating ______ that can be experienced in Southeast Asia.", options: ["journeys", "expeditions", "destinations", "explorations"], correctOption: "destinations" },
      { id: 5, text: "Nick has just returned from his holiday looking relaxed and ______.", options: ["cool", "worried", "tanned", "exhausted"], correctOption: "tanned" },
      { id: 6, text: "Ha Long Bay has twice been ______ by UNESCO as a World Natural Heritage Site.", options: ["experienced", "recognized", "discovered", "developed"], correctOption: "recognized" },
      { id: 7, text: "Our ______ showed us around the old town and regaled us with historical stories.", options: ["travel agent", "holidaymaker", "sightseer", "tour guide"], correctOption: "tour guide" },
      { id: 8, text: "Emily often ______ for cheap plane tickets two to six months prior to her trip.", options: ["rent", "wander", "hunt", "work"], correctOption: "hunt" },
      { id: 9, text: "Spending the holidays at a campsite in the forest isn't very ______ to me.", options: ["appealing", "breathtaking", "smooth", "detailed"], correctOption: "appealing" },
      { id: 10, text: "Traveling in Kuala Lumpur is very convenient, and the ______ of transportation is cheap.", options: ["offer", "cost", "ticket", "season"], correctOption: "cost" }
    ]
  };

  // FETCH DANH SÁCH QUIZ TỪ FIREBASE
  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "quizzes"));
      const quizzesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài tập:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // HÀM TẠO NHANH BÀI TẬP TỪ PDF LÊN FIREBASE
  const handleCreateQuizBA25 = async () => {
    try {
      // Lưu vào collection 'quizzes' với document ID là 'BA25_GR9'
      await setDoc(doc(db, "quizzes", "BA25_GR9"), quizBA25Data);
      alert("Đã tạo và Import thành công bài Quiz BA25 GR9 (10 câu)!");
      fetchQuizzes(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi tạo Quiz:", error);
      alert("Có lỗi xảy ra khi lưu Quiz lên hệ thống.");
    }
  };

  // HÀM XÓA BÀI TẬP
  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) {
      try {
        await deleteDoc(doc(db, "quizzes", quizId));
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (error) {
        console.error("Lỗi xóa Quiz:", error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#003366', fontWeight: '800', margin: 0 }}>Thư viện Bài tập</h2>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Quản lý các bài trắc nghiệm và câu hỏi.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Button variant="success" style={{ width: 'auto', backgroundColor: '#e67e22' }} onClick={handleCreateQuizBA25}>
            ⚡ Khởi tạo nhanh Quiz BA25 GR9
          </Button>
          <Button variant="primary" style={{ width: 'auto' }} onClick={() => navigate('/teacher/exercises/new')}>
            + Tạo bài tập mới
          </Button>
        </div>
      </div>

      {/* DANH SÁCH BÀI TẬP HIỂN THỊ TỪ FIREBASE */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '600', backgroundColor: 'white', borderRadius: '16px' }}>
          Đang tải danh sách bài tập...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {quizzes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              Chưa có bài tập nào. Hãy bấm "Khởi tạo nhanh" để tải dữ liệu mẫu.
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div>
                  <h3 style={{ color: '#003366', fontSize: '18px', margin: '0 0 8px 0', fontWeight: '700' }}>{quiz.title}</h3>
                  <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', gap: '15px' }}>
                    <span>📝 Số câu hỏi: <strong style={{color: '#e67e22'}}>{quiz.questions?.length || 0}</strong></span>
                    <span>📅 Ngày tạo: {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#003366', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Josefin Sans', sans-serif" }}>Chỉnh sửa</button>
                  <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Josefin Sans', sans-serif" }}>Xóa</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}