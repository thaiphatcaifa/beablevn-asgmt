import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Trạng thái giao diện chung
  const [activeLibrary, setActiveLibrary] = useState('Personal');
  const [activeTab, setActiveTab] = useState('Quizzes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trạng thái điều hướng Folder
  const [currentFolder, setCurrentFolder] = useState(null); // null = đang ở thư mục gốc (Root)

  // Trạng thái Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // State danh sách Libraries (Cho phép thêm mới)
  const [libraries, setLibraries] = useState([
    { id: 'personal', name: 'Personal', count: '2.2K', icon: '👤' },
    { id: 'ba-ie-rd', name: 'BA IE - RD', count: '450', icon: '📚' },
    { id: 'ba-flyers', name: 'BA - Flyers', count: '120', icon: '📚' },
    { id: 'ba-ie-comp', name: 'BA IE - Comprehension', count: '89', icon: '📚' }
  ]);

  // FETCH DỮ LIỆU TỪ FIREBASE
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Quizzes
      const qSnap = await getDocs(collection(db, "quizzes"));
      const quizzesData = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(quizzesData);

      // 2. Fetch Folders
      const fSnap = await getDocs(collection(db, "folders"));
      const foldersData = fSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFolders(foldersData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // HÀM XỬ LÝ FOLDERS
  const handleCreateFolder = async () => {
    if (!inputValue.trim()) return;
    try {
      const newFolder = {
        name: inputValue.trim(),
        modified: new Date().toISOString(),
        library: activeLibrary,
        parentId: currentFolder ? currentFolder.id : null // Nếu đang ở trong folder thì gán parentId
      };
      await addDoc(collection(db, "folders"), newFolder);
      setInputValue('');
      setShowFolderModal(false);
      fetchData(); // Reload lại dữ liệu
    } catch (error) {
      console.error("Lỗi tạo folder:", error);
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation(); // Ngăn không cho click chui vào folder khi bấm xóa
    if (window.confirm("Bạn có chắc chắn muốn xóa thư mục này?")) {
      try {
        await deleteDoc(doc(db, "folders", folderId));
        setFolders(folders.filter(f => f.id !== folderId));
      } catch (error) {
        console.error("Lỗi xóa Folder:", error);
      }
    }
  };

  // HÀM XỬ LÝ LIBRARIES
  const handleCreateLibrary = () => {
    if (!inputValue.trim()) return;
    const newLib = {
      id: Date.now().toString(),
      name: inputValue.trim(),
      count: '0',
      icon: '📚'
    };
    setLibraries([...libraries, newLib]);
    setActiveLibrary(newLib.name);
    setInputValue('');
    setShowLibraryModal(false);
  };

  // HÀM XỬ LÝ QUIZZES
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

  // Lọc dữ liệu hiển thị theo Library và Folder hiện tại
  const displayFolders = folders.filter(f => 
    f.library === activeLibrary && 
    f.parentId === (currentFolder ? currentFolder.id : null)
  );

  // Tạm thời coi tất cả quiz hiển thị ở Root, trong thực tế bạn có thể thêm trường folderId vào Quiz
  const displayQuizzes = currentFolder ? [] : quizzes; 

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
      
      {/* 1. LIBRARY NAVIGATION PANEL (LEFT SIDEBAR) */}
      <div style={{ width: '280px', borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '25px 20px' }}>
        <button 
          onClick={() => { setInputValue(''); setShowLibraryModal(true); }}
          style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#003366', fontWeight: '700', cursor: 'pointer', marginBottom: '30px', transition: 'all 0.2s' }} 
          onMouseOver={e => e.target.style.borderColor = '#003366'}
          onMouseOut={e => e.target.style.borderColor = '#cbd5e1'}
        >
          + Join or Create Library
        </button>

        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '15px' }}>My Libraries</h4>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {libraries.map(lib => (
            <li key={lib.id} 
                onClick={() => { setActiveLibrary(lib.name); setCurrentFolder(null); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px', backgroundColor: activeLibrary === lib.name ? '#e2e8f0' : 'transparent', color: activeLibrary === lib.name ? '#003366' : '#475569', fontWeight: activeLibrary === lib.name ? '700' : '500', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{lib.icon}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{lib.name}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lib.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. QUIZ REPOSITORY WORKSPACE (MAIN AREA) */}
      <div style={{ flex: 1, padding: '30px 40px', backgroundColor: 'white', position: 'relative' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '25px' }}>
          
          {/* Tiêu đề & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <h2 style={{ color: '#003366', fontWeight: '800', margin: 0, fontSize: '24px' }}>
              {activeLibrary}
            </h2>
            {currentFolder && (
              <>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>/</span>
                <h2 style={{ color: '#e67e22', fontWeight: '800', margin: 0, fontSize: '24px' }}>
                  {currentFolder.name}
                </h2>
                <button 
                  onClick={() => setCurrentFolder(null)}
                  style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
                >
                  🔙 Quay lại
                </button>
              </>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '30px' }}>
              {['Quizzes', 'Deleted'].map(tab => (
                <div key={tab} 
                     onClick={() => setActiveTab(tab)}
                     style={{ paddingBottom: '12px', cursor: 'pointer', fontWeight: activeTab === tab ? '700' : '500', color: activeTab === tab ? '#003366' : '#94a3b8', borderBottom: activeTab === tab ? '3px solid #003366' : '3px solid transparent' }}>
                  {tab}
                </div>
              ))}
            </div>

            {/* Toolbar Actions */}
            <div style={{ display: 'flex', gap: '15px', paddingBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 15px 10px 35px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', width: '200px' }} />
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
              </div>
              <button 
                onClick={() => { setInputValue(''); setShowFolderModal(true); }}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                📁 New Folder
              </button>
              <Button variant="primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/teacher/exercises/new')}>
                + Add Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Content Items List */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 50px', padding: '10px 20px', color: '#94a3b8', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>
            <div>Name</div>
            <div>Modified</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Render Folders */}
              {displayFolders.map(folder => (
                <div key={folder.id} 
                     onClick={() => setCurrentFolder(folder)}
                     style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 50px', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} 
                     onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                     onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#334155', fontWeight: '600' }}>
                    <span style={{ fontSize: '20px' }}>📁</span>
                    {folder.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    {new Date(folder.modified).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={(e) => handleDeleteFolder(folder.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Delete Folder">🗑️</button>
                  </div>
                </div>
              ))}

              {/* Render Quizzes */}
              {displayQuizzes.map(quiz => (
                <div key={quiz.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 50px', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <div>
                      <div style={{ color: '#003366', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate(`/teacher/exercises/${quiz.id}`)}>
                        {quiz.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{quiz.questions?.length || 0} Questions</div>
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                     <button onClick={() => navigate(`/teacher/exercises/${quiz.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Edit">✏️</button>
                     <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}

              {displayQuizzes.length === 0 && displayFolders.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  {currentFolder ? "Thư mục này đang trống." : "Thư viện trống. Hãy tạo Folder hoặc Add Quiz."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL TẠO FOLDER MỚI */}
        {showFolderModal && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', width: '400px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px' }}>Tạo Thư mục mới</h3>
              <Input placeholder="Tên thư mục..." value={inputValue} onChange={e => setInputValue(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button variant="success" onClick={handleCreateFolder}>Tạo</Button>
                <Button variant="danger" onClick={() => setShowFolderModal(false)} style={{ backgroundColor: '#94a3b8', boxShadow: 'none' }}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TẠO LIBRARY MỚI */}
        {showLibraryModal && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', width: '400px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px' }}>Tạo Thư viện nội dung</h3>
              <Input placeholder="Tên thư viện..." value={inputValue} onChange={e => setInputValue(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Button variant="success" onClick={handleCreateLibrary}>Tạo</Button>
                <Button variant="danger" onClick={() => setShowLibraryModal(false)} style={{ backgroundColor: '#94a3b8', boxShadow: 'none' }}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}