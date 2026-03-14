import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';

// --- HỆ THỐNG ICONS TỐI GIẢN (SVG) ---
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Folder: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Quiz: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  More: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Move: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><polyline points="9 14 12 17 15 14"></polyline></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Restore: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>,
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
};

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [folders, setFolders] = useState([]);
  
  // Trạng thái giao diện chung
  const [viewTab, setViewTab] = useState('Quizzes'); // 'Quizzes' hoặc 'Deleted'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Trạng thái Modals & Menu
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Giả lập Fetch Data
  useEffect(() => {
    setFolders([
      { id: 'f1', name: 'Unit 1: Mathematics', modified: '2024-03-10', parentId: null },
      { id: 'f2', name: 'Unit 2: Science', modified: '2024-03-12', parentId: null }
    ]);
    setQuizzes([
      { id: 'q1', title: 'Midterm Math Test', modified: '2024-03-14', folderId: 'f1', isDeleted: false },
      { id: 'q2', title: 'Physics Quiz 1', modified: '2024-03-15', folderId: 'f2', isDeleted: false },
      { id: 'q3', title: 'General Knowledge', modified: '2024-03-01', folderId: null, isDeleted: false },
      { id: 'q4', title: 'Old History Test', modified: '2024-01-20', folderId: null, isDeleted: true }
    ]);
  }, []);

  // --- CÁC HÀM XỬ LÝ CHỨC NĂNG ---
  const handleRename = (item, isFolder) => {
    const currentName = isFolder ? item.name : item.title;
    const newName = window.prompt("Nhập tên mới:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      if (isFolder) setFolders(folders.map(f => f.id === item.id ? { ...f, name: newName } : f));
      else setQuizzes(quizzes.map(q => q.id === item.id ? { ...q, title: newName } : q));
    }
    setActiveMenuId(null);
  };

  const handleDuplicate = (quiz) => {
    const duplicatedQuiz = { ...quiz, id: 'q_' + Date.now(), title: quiz.title + ' (Copy)', modified: new Date().toISOString().split('T')[0] };
    setQuizzes([...quizzes, duplicatedQuiz]);
    setActiveMenuId(null);
  };

  const handleMove = (item, isFolder) => {
    const targetFolderName = window.prompt("Nhập tên thư mục muốn chuyển tới (Để trống để chuyển ra thư mục gốc):");
    if (targetFolderName !== null) {
      let targetFolderId = null;
      if (targetFolderName.trim() !== "") {
        const targetFolder = folders.find(f => f.name.toLowerCase() === targetFolderName.toLowerCase().trim());
        if (targetFolder) targetFolderId = targetFolder.id;
        else { alert("Không tìm thấy thư mục có tên này!"); setActiveMenuId(null); return; }
      }
      if (isFolder) setFolders(folders.map(f => f.id === item.id ? { ...f, parentId: targetFolderId } : f));
      else setQuizzes(quizzes.map(q => q.id === item.id ? { ...q, folderId: targetFolderId } : q));
    }
    setActiveMenuId(null);
  };

  const handleDelete = (item, isFolder) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${isFolder ? 'thư mục' : 'bài tập'} này?`)) {
      if (isFolder) setFolders(folders.filter(f => f.id !== item.id));
      else setQuizzes(quizzes.map(q => q.id === item.id ? { ...q, isDeleted: true } : q));
    }
    setActiveMenuId(null);
  };

  const handleRestore = (item) => {
    setQuizzes(quizzes.map(q => q.id === item.id ? { ...q, isDeleted: false } : q));
    setActiveMenuId(null);
  };

  const handleHardDelete = (item) => {
    if (window.confirm("Bạn có chắc muốn xóa VĨNH VIỄN bài tập này? Thao tác này không thể hoàn tác.")) {
      setQuizzes(quizzes.filter(q => q.id !== item.id));
    }
    setActiveMenuId(null);
  };

  const handleSelectAll = (e, itemsToSelect) => {
    if (e.target.checked) setSelectedItems(itemsToSelect.map(item => item.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
  };

  // Lọc hiển thị dữ liệu
  const displayedFolders = folders.filter(f => viewTab === 'Quizzes' && f.parentId === currentFolder && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayedQuizzes = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (viewTab === 'Deleted') return q.isDeleted && matchSearch;
    return !q.isDeleted && q.folderId === currentFolder && matchSearch;
  });

  const allDisplayedItems = [...displayedFolders, ...displayedQuizzes];

  // --- COMPONENT: MENU MORE OPTIONS ---
  const renderMoreOptions = (item, isFolder) => {
    if (activeMenuId !== item.id) return null;

    const btnStyle = { width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' };

    if (viewTab === 'Deleted') {
      return (
        <div ref={menuRef} style={{ position: 'absolute', right: '40px', top: '30px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px', padding: '8px 0' }}>
          <button style={{ ...btnStyle, color: '#10b981' }} onClick={() => handleRestore(item)}> <Icons.Restore /> Khôi phục</button>
          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
          <button style={{ ...btnStyle, color: '#ef4444' }} onClick={() => handleHardDelete(item)}> <Icons.Trash /> Xóa vĩnh viễn</button>
        </div>
      );
    }

    return (
      <div ref={menuRef} style={{ position: 'absolute', right: '40px', top: '30px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '160px', padding: '8px 0' }}>
        <button style={btnStyle} onClick={() => handleRename(item, isFolder)}> <Icons.Edit /> Edit</button>
        {!isFolder && <button style={btnStyle} onClick={() => handleDuplicate(item)}> <Icons.Copy /> Duplicate</button>}
        <button style={btnStyle} onClick={() => handleMove(item, isFolder)}> <Icons.Move /> Move</button>
        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
        <button style={{ ...btnStyle, color: '#ef4444' }} onClick={() => handleDelete(item, isFolder)}> <Icons.Trash /> Delete</button>
      </div>
    );
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER TỐI GIẢN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ color: '#003366', margin: 0, fontSize: '28px', fontWeight: '800' }}>Library {currentFolder ? `> Folder` : ''}</h2>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '15px' }}>Quản lý và tổ chức các bài tập (Quizzes)</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}><Icons.Search /></span>
            <input 
              type="text" placeholder="Search quiz..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', width: '220px', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#003366'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <Button onClick={() => setShowFolderModal(true)} style={{ backgroundColor: 'white', color: '#003366', border: '2px solid #003366', fontWeight: '700', padding: '0 20px', borderRadius: '8px' }}>
            + New Folder
          </Button>
          <Button onClick={() => navigate('/teacher/create')} style={{ backgroundColor: '#003366', color: 'white', border: 'none', fontWeight: '700', padding: '0 20px', borderRadius: '8px' }}>
            + Add Quiz
          </Button>
        </div>
      </div>

      {/* TABS (Quizzes / Deleted) */}
      <div style={{ display: 'flex', gap: '30px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button 
          onClick={() => { setViewTab('Quizzes'); setSelectedItems([]); }}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'Quizzes' ? '#003366' : '#94a3b8', borderBottom: viewTab === 'Quizzes' ? '3px solid #003366' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}
        >
          Quizzes
        </button>
        <button 
          onClick={() => { setViewTab('Deleted'); setSelectedItems([]); setCurrentFolder(null); }}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: viewTab === 'Deleted' ? '#003366' : '#94a3b8', borderBottom: viewTab === 'Deleted' ? '3px solid #003366' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}
        >
          Deleted
        </button>
      </div>

      {/* TABLE VIEW CHÍNH */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'visible', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 200px 80px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '800', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '12px 12px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input type="checkbox" onChange={(e) => handleSelectAll(e, allDisplayedItems)} checked={selectedItems.length > 0 && selectedItems.length === allDisplayedItems.length} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#003366' }} />
          </div>
          <div>Name</div>
          <div>Modified</div>
          <div style={{ textAlign: 'center' }}>Options</div>
        </div>

        {/* Nút Back khi ở trong Folder */}
        {currentFolder && viewTab === 'Quizzes' && (
          <div onClick={() => setCurrentFolder(null)} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
            <div style={{ width: '60px', display: 'flex', justifyContent: 'center' }}><Icons.Back /></div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Quay lại cấp trước</span>
          </div>
        )}

        {/* Table Body - Folders */}
        {displayedFolders.map(folder => (
          <div key={folder.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 200px 80px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', position: 'relative', transition: 'background 0.2s', zIndex: activeMenuId === folder.id ? 50 : 1 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={selectedItems.includes(folder.id)} onChange={() => handleSelectItem(folder.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#003366' }} />
            </div>
            <div onClick={() => setCurrentFolder(folder.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
              <Icons.Folder />
              <span style={{ fontWeight: '700', color: '#003366', fontSize: '15px' }}>{folder.name}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{folder.modified}</div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setActiveMenuId(activeMenuId === folder.id ? null : folder.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <Icons.More />
              </button>
              {renderMoreOptions(folder, true)}
            </div>
          </div>
        ))}

        {/* Table Body - Quizzes */}
        {displayedQuizzes.map(quiz => (
          <div key={quiz.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 200px 80px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', position: 'relative', transition: 'background 0.2s', zIndex: activeMenuId === quiz.id ? 50 : 1 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={selectedItems.includes(quiz.id)} onChange={() => handleSelectItem(quiz.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#003366' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Icons.Quiz />
              <span style={{ fontWeight: '600', color: '#334155', fontSize: '15px', textDecoration: quiz.isDeleted ? 'line-through' : 'none', opacity: quiz.isDeleted ? 0.6 : 1 }}>{quiz.title}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>{quiz.modified}</div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setActiveMenuId(activeMenuId === quiz.id ? null : quiz.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <Icons.More />
              </button>
              {renderMoreOptions(quiz, false)}
            </div>
          </div>
        ))}

        {allDisplayedItems.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>
            Không có dữ liệu trong mục này.
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showFolderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontWeight: '800' }}>Tạo Thư mục mới</h3>
            <Input placeholder="Tên thư mục..." value={inputValue} onChange={e => setInputValue(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <Button style={{ backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1' }} onClick={() => setShowFolderModal(false)}>Hủy</Button>
              <Button style={{ backgroundColor: '#003366', color: 'white', border: 'none' }}>Tạo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}