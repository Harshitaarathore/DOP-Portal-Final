import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';



function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersion, setNewVersion] = useState({ version: '', notes: '' });
  const [versionFile, setVersionFile] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'NAAC', access_level: 'public', version: '1.0' });
  const [selectedFile, setSelectedFile] = useState(null);

  const role  = localStorage.getItem('role');
  const name  = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const res = await API.get('/documents');
      if (res.data.success) setDocuments(res.data.data);
    } catch (err) {
      console.log('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleUpload = async () => {
  if (!newDoc.title.trim()) { showToast('Document title is required', 'error'); return; }
  try {
    const formData = new FormData();
    formData.append('title', newDoc.title);
    formData.append('category', newDoc.category);
    formData.append('access_level', newDoc.access_level);
    formData.append('version', newDoc.version);
    if (selectedFile) formData.append('file', selectedFile);

    const res = await API.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.data.success) {
      setShowUploadForm(false);
      setNewDoc({ title: '', category: 'NAAC', access_level: 'public', version: '1.0' });
      setSelectedFile(null);
      fetchDocuments();
      showToast('Document uploaded successfully ✓');
    } else {
      showToast(res.data.message, 'error');
    }
  } catch {
    showToast('Failed to upload document', 'error');
  }
};

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this document and all its versions?')) return;
  try {
    const res = await API.delete(`/documents/${id}`);
    if (res.data.success) {
      fetchDocuments();
      setShowVersions(false);
      showToast('Document deleted successfully ✓');
    } else {
      showToast(res.data.message || 'Failed to delete', 'error');
    }
  } catch {
    showToast('Failed to delete document', 'error');
  }
};

  const fetchVersions = async (docId) => {
    try {
      const res = await API.get(`/documents/${docId}/versions`);
      if (res.data.success) setVersions(res.data.data);
    } catch (err) { console.log('Error fetching versions:', err); }
  };

  const handleViewVersions = (doc) => {
    setSelectedDoc(doc);
    setShowVersions(true);
    setShowNewVersion(false);
    fetchVersions(doc.id);
  };

  const handleAddVersion = async () => {
    if (!newVersion.version) { alert('Version number required'); return; }
    try {
      const formData = new FormData();
      formData.append('version', newVersion.version);
      formData.append('notes', newVersion.notes);
      if (versionFile) formData.append('file', versionFile);
      const res = await API.post(`/documents/${selectedDoc.id}/version`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setShowNewVersion(false);
        setNewVersion({ version: '', notes: '' });
        setVersionFile(null);
        fetchVersions(selectedDoc.id);
        fetchDocuments();
      }
    } catch { alert('Failed to upload version'); }
  };

  const categories = ['all','NAAC','NBA','Finance','HR','Research','Minutes','Events','Letters','Policies','Other'];
  const filtered = documents
    .filter(d => activeTab === 'all' || d.category === activeTab)
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const acBg    = { public:'#DCFCE7', restricted:'#FEF3C7', confidential:'#FEE2E2' };
  const acColor = { public:'#166534', restricted:'#92400E', confidential:'#991B1B' };

  const getFileIcon = (filePath) => {
    if (!filePath) return '📄';
    const ext = filePath.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    if (ext === 'xlsx' || ext === 'xls') return '📊';
    return '📁';
  };

  const navItems = [
    { label:'Dashboard', path: role === 'Director' ? '/director-dashboard' : '/dashboard', icon:'🏠' },
    { label:'Calendar',      path:'/calendar',       icon:'📅' },
    { label:'Requests',      path:'/requests',       icon:'📋' },
    { label:'Documents',     path:'/documents',      icon:'📁' },
    { label:'Visitors',      path:'/visitors',       icon:'👥' },
    { label:'Communication', path:'/communications', icon:'💬' },
    { label:'Tasks',         path:'/tasks',          icon:'✅' },
    { label:'Announcements', path:'/announcements',  icon:'📢' },
    { label:'Reports',       path:'/reports',        icon:'📊' },
    { label:'Settings',      path:'/settings',       icon:'⚙️' },
  ];

  const stats = [
    { label:'Total Docs',   num: documents.length,                                            bg:'#EFF6FF', color:'#1A3A6B' },
    { label:'Confidential', num: documents.filter(d=>d.access_level==='confidential').length, bg:'#FEE2E2', color:'#991B1B' },
    { label:'Restricted',   num: documents.filter(d=>d.access_level==='restricted').length,   bg:'#FEF3C7', color:'#92400E' },
    { label:'Public',       num: documents.filter(d=>d.access_level==='public').length,       bg:'#DCFCE7', color:'#166534' },
  ];


  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Converts Cloudinary raw URL to a viewable URL using Google Docs viewer
const getViewUrl = (filePath) => {
  if (!filePath) return '#';
  // Use Google Docs viewer for PDFs — works perfectly for any public URL
  if (filePath.includes('.pdf') || filePath.toLowerCase().endsWith('pdf')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(filePath)}&embedded=true`;
  }
  return filePath;
};

  return (
    <div style={S.page}>

      {/* SIDEBAR — matches Calendar/Requests exactly */}
      <div style={S.sidebar}>
        <div style={S.logoWrap}>
          <img src={lnmiitLogo} alt="LNMIIT" style={S.logo} />
        </div>
        <div style={S.portalBanner}>
          <div style={S.portalName}>Director's Office Portal</div>
          <div style={S.portalDate}>{today}</div>
        </div>
        <div style={S.divider} />
        {navItems.map((item, i) => (
          <div key={i}
            style={{
              ...S.navItem,
              ...(item.path === window.location.pathname ? S.navActive : {}),
              ...(hoveredNav === i && item.path !== window.location.pathname ? { background:'#F8FAFC', color:'#1A3A6B' } : {})
            }}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => navigate(item.path)}
          >
            <span style={S.navIcon}>{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* TOPBAR — matches Calendar/Requests exactly */}
        <div style={S.topbar}>
          <div style={S.topbarUser}>
            <div style={S.topbarAvatar}>{initials}</div>
            <div>
              <div style={S.topbarUserName}>{name}</div>
              <div style={S.topbarUserEmail}>{email}</div>
              <div style={S.topbarUserRole}>{role}</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>🔔</div>
            {/* <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button> */}
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📁 Documents</div>
              <div style={S.pageSub}>Manage and access all official documents</div>
            </div>
            {(role === 'Secretary' || role === 'Director') && (
              <button style={S.addBtn} onClick={() => setShowUploadForm(!showUploadForm)}>+ Upload Document</button>
            )}
          </div>

          {/* UPLOAD FORM */}
          {showUploadForm && (
            <div style={S.addForm}>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <input style={{ ...S.input, flex:2 }} placeholder="Document title *" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title:e.target.value})} />
                <select style={{ ...S.input, flex:1 }} value={newDoc.category} onChange={e => setNewDoc({...newDoc, category:e.target.value})}>
                  {['NAAC','NBA','Finance','HR','Research','Minutes','Events','Letters','Policies','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <select style={{ ...S.input, flex:1 }} value={newDoc.access_level} onChange={e => setNewDoc({...newDoc, access_level:e.target.value})}>
                  <option value="public">Public</option>
                  <option value="restricted">Restricted</option>
                  <option value="confidential">Confidential</option>
                </select>
                <input style={{ ...S.input, flex:1 }} placeholder="Version (e.g. 1.0)" value={newDoc.version} onChange={e => setNewDoc({...newDoc, version:e.target.value})} />
                <input style={{ ...S.input, flex:2 }} type="file" onChange={e => setSelectedFile(e.target.files[0])} />
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={S.addBtn} onClick={handleUpload}>Upload</button>
                <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => setShowUploadForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div style={S.statRow}>
            {stats.map((s, i) => (
              <div key={i}
                style={{
                  ...S.statCard,
                  background: s.bg,
                  transform: hoveredStat === i ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredStat === i ? '0 6px 16px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SEARCH */}
          <div style={{ marginBottom:'12px' }}>
            <input style={S.searchInput} type="text" placeholder="🔍  Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* CATEGORY TABS */}
          <div style={S.tabs}>
            {categories.map(cat => (
              <div key={cat}
                style={{ ...S.tab, ...(activeTab === cat ? S.tabActive : {}) }}
                onClick={() => setActiveTab(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </div>
            ))}
          </div>

          {/* DOCUMENT LIST */}
          <div style={S.docList}>
            <div style={S.tableHeader}>
              <div style={{ ...S.th, flex:3 }}>Document Name</div>
              <div style={{ ...S.th, flex:1 }}>Category</div>
              <div style={{ ...S.th, flex:1 }}>Date</div>
              <div style={{ ...S.th, flex:0.7 }}>Version</div>
              <div style={{ ...S.th, flex:1 }}>Access</div>
              <div style={{ ...S.th, flex:1.6 }}>Actions</div>
            </div>

            {loading ? (
              <div style={S.noResults}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={S.noResults}>No documents found</div>
            ) : filtered.map(doc => (
              <div key={doc.id} style={S.tableRow}>
                <div style={{ ...S.td, flex:3 }}>
                  <span style={S.docIcon}>{getFileIcon(doc.file_path)}</span>
                  <span style={S.docName}>{doc.title}</span>
                </div>
                <div style={{ ...S.td, flex:1 }}>
                  <span style={S.catBadge}>{doc.category}</span>
                </div>
                <div style={{ ...S.td, flex:1 }}>
                  <span style={S.tdMuted}>{new Date(doc.upload_date).toLocaleDateString()}</span>
                </div>
                <div style={{ ...S.td, flex:0.7 }}>
                  <span style={S.tdMuted}>v{doc.version}</span>
                </div>
                <div style={{ ...S.td, flex:1 }}>
                  <span style={{ ...S.badge2, background:acBg[doc.access_level], color:acColor[doc.access_level] }}>{doc.access_level}</span>
                </div>
                <div style={{ ...S.td, flex:1.6, gap:'6px' }}>
                  {doc.file_path && (
                    <a href={getViewUrl(doc.file_path)} target="_blank" rel="noreferrer">
                      <button style={S.viewBtn}>View</button>
                    </a>
                  )}
                  <button style={S.historyBtn} onClick={() => handleViewVersions(doc)}>History</button>
                  {(role === 'Secretary' || role === 'Director') && (
                    <button style={S.dlBtn} onClick={() => handleDelete(doc.id)}>🗑</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VERSION HISTORY PANEL */}
          {showVersions && selectedDoc && (
            <div style={S.versionPanel}>
              <div style={S.versionHeader}>
                <div>
                  <div style={S.versionTitle}>📋 Version History — {selectedDoc.title}</div>
                  <div style={{ fontSize:'10px', color:'#64748B' }}>Current version: v{selectedDoc.version}</div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {(role === 'Secretary' || role === 'Director') && (
                    <button style={S.addBtn} onClick={() => setShowNewVersion(!showNewVersion)}>+ New Version</button>
                  )}
                  <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setShowVersions(false); setShowNewVersion(false); }}>Close</button>
                </div>
              </div>

              {showNewVersion && (
                <div style={{ ...S.addForm, margin:'12px 16px' }}>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <input style={{ ...S.input, flex:1 }} placeholder="Version number (e.g. 2.0)" value={newVersion.version} onChange={e => setNewVersion({...newVersion, version:e.target.value})} />
                    <input style={{ ...S.input, flex:2 }} placeholder="Notes about this version" value={newVersion.notes} onChange={e => setNewVersion({...newVersion, notes:e.target.value})} />
                    <input style={{ ...S.input, flex:1 }} type="file" onChange={e => setVersionFile(e.target.files[0])} />
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button style={S.addBtn} onClick={handleAddVersion}>Upload Version</button>
                    <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => setShowNewVersion(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={S.docList}>
                <div style={S.tableHeader}>
                  <div style={{ ...S.th, flex:1 }}>Version</div>
                  <div style={{ ...S.th, flex:2 }}>Notes</div>
                  <div style={{ ...S.th, flex:1.5 }}>Upload Date</div>
                  <div style={{ ...S.th, flex:0.8 }}>File</div>
                </div>
                {versions.length === 0 ? (
                  <div style={S.noResults}>No version history found</div>
                ) : versions.map((v, i) => (
                  <div key={i} style={S.tableRow}>
                    <div style={{ ...S.td, flex:1 }}>
                      <span style={{ ...S.badge2, background:'#EFF6FF', color:'#1A3A6B' }}>v{v.version}</span>
                    </div>
                    <div style={{ ...S.td, flex:2 }}>
                      <span style={S.tdMuted}>{v.notes || 'No notes'}</span>
                    </div>
                    <div style={{ ...S.td, flex:1.5 }}>
                      <span style={S.tdMuted}>{new Date(v.upload_date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ ...S.td, flex:0.8 }}>
                      {v.file_path ? (
                        <a href={getViewUrl(v.file_path)} target="_blank" rel="noreferrer">
                          <button style={S.viewBtn}>View</button>
                        </a>
                      ) : (
                        <span style={S.tdMuted}>No file</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      {toast && (
  <div style={{
    position: 'fixed', bottom: '24px', right: '24px',
    background: toast.type === 'success' ? '#166534' : '#991B1B',
    color: '#fff', padding: '12px 20px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', zIndex: 9999,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    display: 'flex', alignItems: 'center', gap: '8px',
    animation: 'fadeIn 0.2s ease',
  }}>
    {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
  </div>
)}
    </div>
  );
}

const S = {
  page:           { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F5F7FA', overflow:'hidden' },
  // Sidebar — identical to Calendar & Requests
  sidebar:        { width:'200px', background:'#fff', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:'1px solid #E2E8F0', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap:       { padding:'14px 16px 12px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'center' },
  logo:           { width:'130px', objectFit:'contain' },
  portalBanner:   { padding:'14px 16px' },
  portalName:     { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.4, marginBottom:'6px', fontFamily:"'DM Sans',sans-serif" },
  portalDate:     { color:'#64748B', fontSize:'11px', fontWeight:'500', fontFamily:"'DM Sans',sans-serif" },
  divider:        { height:'1px', background:'#E2E8F0', margin:'4px 0' },
  navItem:        { padding:'10px 16px', cursor:'pointer', fontSize:'12px', color:'#475569', fontWeight:'500', borderLeft:'3px solid transparent', transition:'all 0.2s ease', userSelect:'none' },
  navActive:      { background:'#EFF6FF', color:'#1A3A6B', borderLeft:'3px solid #2563EB', fontWeight:'700' },
  navIcon:        { fontSize:'14px', marginRight:'8px', flexShrink:0 },
  // Main
  main:           { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:         { background:'#fff', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser:     { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:   { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 },
  topbarUserName: { color:'#1A3A6B', fontSize:'13px', fontWeight:'700' },
  topbarUserEmail:{ color:'#94A3B8', fontSize:'9px' },
  topbarUserRole: { color:'#64748B', fontSize:'10px' },
  topbarRight:    { display:'flex', alignItems:'center', gap:'8px' },
  notifWrap:      { position:'relative', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'6px', padding:'6px 10px', color:'#1A3A6B', fontSize:'14px', cursor:'pointer' },
  btnOutline:     { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnLogout:      { background:'#DC2626', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  // Content
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:         { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'4px', padding:'8px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  addForm:        { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'10px' },
  input:          { padding:'8px 12px', borderRadius:'4px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none', fontFamily:"'DM Sans',sans-serif" },
  // Stats
  statRow:        { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #E2E8F0' },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  // Search
  searchInput:    { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', background:'#fff' },
  // Tabs
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', flexWrap:'wrap' },
  tab:            { padding:'6px 14px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  // Document table
  docList:        { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  tableHeader:    { display:'flex', alignItems:'center', padding:'10px 16px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' },
  th:             { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:       { display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #F8FAFC' },
  td:             { display:'flex', alignItems:'center', gap:'6px', paddingRight:'8px' },
  docIcon:        { fontSize:'16px', flexShrink:0 },
  docName:        { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  catBadge:       { fontSize:'9px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px', background:'#EFF6FF', color:'#1A3A6B' },
  tdMuted:        { fontSize:'10px', color:'#94A3B8' },
  badge2:         { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  viewBtn:    { background:'#EFF6FF', color:'#1A3A6B', border:'1px solid #BFDBFE', borderRadius:'6px', padding:'5px 12px', fontSize:'11px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  historyBtn: { background:'#F0FDF4', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'6px', padding:'5px 12px', fontSize:'11px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  dlBtn:      { background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'14px', cursor:'pointer', lineHeight:1 },    
  // Version panel
  versionPanel:   { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', marginTop:'14px', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  versionHeader:  { padding:'14px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  versionTitle:   { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'2px' },
};

export default Documents;