import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersion, setNewVersion] = useState({ version: '', notes: '' });
  const [versionFile, setVersionFile] = useState(null);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'NAAC', access_level: 'public', version: '1.0' });
  const [selectedFile, setSelectedFile] = useState(null);
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newDoc.title);
      formData.append('category', newDoc.category);
      formData.append('access_level', newDoc.access_level);
      formData.append('version', newDoc.version);
      if (selectedFile) formData.append('file', selectedFile);

      const res = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert('Document uploaded!');
        setShowUploadForm(false);
        setNewDoc({ title: '', category: 'NAAC', access_level: 'public', version: '1.0' });
        setSelectedFile(null);
        fetchDocuments();
      }
    } catch (err) {
      alert('Failed to upload document');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const res = await API.delete(`/documents/${id}`);
      if (res.data.success) fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const categories = ['all', 'NAAC', 'NBA', 'Finance', 'HR', 'Research', 'Minutes', 'Events', 'Letters', 'Policies', 'Other'];

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

  const fetchVersions = async (docId) => {
  try {
    const res = await API.get(`/documents/${docId}/versions`);
    if (res.data.success) setVersions(res.data.data);
  } catch (err) {
    console.log('Error fetching versions:', err);
  }
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

    const res = await API.post(`/documents/${selectedDoc.id}/version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.success) {
      alert('New version uploaded!');
      setShowNewVersion(false);
      setNewVersion({ version: '', notes: '' });
      setVersionFile(null);
      fetchVersions(selectedDoc.id);
      fetchDocuments();
    }
  } catch (err) {
    alert('Failed to upload version');
  }
};

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
          </div>
          <div style={styles.logoTitle}>DOP Portal</div>
          <div style={styles.logoSub}>Director's Office</div>
        </div>
        {[
          {label:'Dashboard', path:'/dashboard'},
          {label:'Calendar',  path:'/calendar'},
          {label:'Requests',  path:'/requests'},
          {label:'Documents', path:'/documents'},
          {label:'Visitors',  path:'/visitors'},
          {label:'Communication', path:'/communications'},
          {label:'Tasks',     path:'/tasks'},
          {label:'Reports',   path:'/reports'},
          {label:'Settings',  path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===3 ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>{role}</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal - LNMIIT</div>
            <div style={styles.topbarSub}>Director's Office Portal</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 {role} ▾</div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📁 Documents</div>
              <div style={styles.pageSub}>Manage and access all official documents</div>
            </div>
            {(role === 'Secretary' || role === 'Director') && (
              <button style={styles.addBtn} onClick={() => setShowUploadForm(!showUploadForm)}>+ Upload Document</button>
            )}
          </div>

          {/* UPLOAD FORM */}
          {showUploadForm && (
            <div style={styles.addForm}>
              <input style={styles.input} placeholder="Document title" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
              <select style={styles.input} value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})}>
                {['NAAC','NBA','Finance','HR','Research','Minutes','Events','Letters','Policies','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={styles.input} value={newDoc.access_level} onChange={e => setNewDoc({...newDoc, access_level: e.target.value})}>
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="confidential">Confidential</option>
              </select>
              <input style={styles.input} placeholder="Version (e.g. 1.0)" value={newDoc.version} onChange={e => setNewDoc({...newDoc, version: e.target.value})} />
              <input style={styles.input} type="file" onChange={e => setSelectedFile(e.target.files[0])} />
              <div style={{display:'flex', gap:'10px'}}>
                <button style={styles.addBtn} onClick={handleUpload}>Upload</button>
                <button style={{...styles.addBtn, background:'#64748B'}} onClick={() => setShowUploadForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              {label:'Total Docs',   num: documents.length,                                              bg:'#EFF6FF', color:'#1A3A6B'},
              {label:'Confidential', num: documents.filter(d=>d.access_level==='confidential').length,   bg:'#FEE2E2', color:'#991B1B'},
              {label:'Restricted',   num: documents.filter(d=>d.access_level==='restricted').length,     bg:'#FEF3C7', color:'#92400E'},
              {label:'Public',       num: documents.filter(d=>d.access_level==='public').length,         bg:'#DCFCE7', color:'#166534'},
            ].map((s,i) => (
              <div key={i} style={{...styles.statCard, background:s.bg}}>
                <div style={{...styles.statNum, color:s.color}}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SEARCH */}
          <div style={styles.searchWrap}>
            <input style={styles.searchInput} type="text" placeholder="🔍  Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* CATEGORY TABS */}
          <div style={styles.tabs}>
            {categories.map(cat => (
              <div key={cat}
                style={{...styles.tab, ...(activeTab===cat ? styles.tabActive : {})}}
                onClick={() => setActiveTab(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </div>
            ))}
          </div>

          {/* DOCUMENT LIST */}
          <div style={styles.docList}>
            <div style={styles.tableHeader}>
              <div style={{...styles.th, flex:3}}>Document Name</div>
              <div style={{...styles.th, flex:1}}>Category</div>
              <div style={{...styles.th, flex:1}}>Date</div>
              <div style={{...styles.th, flex:0.7}}>Version</div>
              <div style={{...styles.th, flex:1}}>Access</div>
              <div style={{...styles.th, flex:0.8}}>Action</div>
            </div>

            {loading ? (
              <div style={styles.noResults}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={styles.noResults}>No documents found</div>
            ) : filtered.map(doc => (
              <div key={doc.id} style={styles.tableRow}>
                <div style={{...styles.td, flex:3}}>
                  <span style={styles.docIcon}>{getFileIcon(doc.file_path)}</span>
                  <span style={styles.docName}>{doc.title}</span>
                </div>
                <div style={{...styles.td, flex:1}}>
                  <span style={styles.catBadge}>{doc.category}</span>
                </div>
                <div style={{...styles.td, flex:1}}>
                  <span style={styles.tdMuted}>{new Date(doc.upload_date).toLocaleDateString()}</span>
                </div>
                <div style={{...styles.td, flex:0.7}}>
                  <span style={styles.tdMuted}>v{doc.version}</span>
                </div>
                <div style={{...styles.td, flex:1}}>
                  <span style={{...styles.badge2, background: acBg[doc.access_level], color: acColor[doc.access_level]}}>{doc.access_level}</span>
                </div>
                <div style={{...styles.td, flex:0.8, gap:'6px'}}>
  {doc.file_path && (
    <a href={`https://dop-portal-production.up.railway.app/uploads/${doc.file_path}`} target="_blank" rel="noreferrer">
      <button style={styles.viewBtn}>View</button>
    </a>
  )}
  <button style={{...styles.viewBtn, background:'#F0FDF4', color:'#166534', border:'1px solid #BBF7D0'}} onClick={() => handleViewVersions(doc)}>History</button>
  {(role === 'Secretary' || role === 'Director') && (
    <button style={styles.dlBtn} onClick={() => handleDelete(doc.id)}>🗑</button>
  )}
</div>
              </div>
            ))}
          </div>
          {/* VERSION HISTORY PANEL */}
{showVersions && selectedDoc && (
  <div style={styles.versionPanel}>
    <div style={styles.versionHeader}>
      <div>
        <div style={styles.versionTitle}>📋 Version History — {selectedDoc.title}</div>
        <div style={{fontSize:'10px', color:'#64748B'}}>Current version: v{selectedDoc.version}</div>
      </div>
      <div style={{display:'flex', gap:'8px'}}>
        {(role === 'Secretary' || role === 'Director') && (
          <button style={styles.addBtn} onClick={() => setShowNewVersion(!showNewVersion)}>+ New Version</button>
        )}
        <button style={{...styles.addBtn, background:'#64748B'}} onClick={() => setShowVersions(false)}>Close</button>
      </div>
    </div>

    {showNewVersion && (
      <div style={styles.addForm}>
        <input style={styles.input} placeholder="Version number (e.g. 2.0)" value={newVersion.version} onChange={e => setNewVersion({...newVersion, version: e.target.value})} />
        <input style={styles.input} placeholder="Notes about this version" value={newVersion.notes} onChange={e => setNewVersion({...newVersion, notes: e.target.value})} />
        <input style={styles.input} type="file" onChange={e => setVersionFile(e.target.files[0])} />
        <div style={{display:'flex', gap:'10px'}}>
          <button style={styles.addBtn} onClick={handleAddVersion}>Upload Version</button>
          <button style={{...styles.addBtn, background:'#64748B'}} onClick={() => setShowNewVersion(false)}>Cancel</button>
        </div>
      </div>
    )}

    <div style={styles.docList}>
      <div style={styles.tableHeader}>
        <div style={{...styles.th, flex:1}}>Version</div>
        <div style={{...styles.th, flex:2}}>Notes</div>
        <div style={{...styles.th, flex:1.5}}>Upload Date</div>
        <div style={{...styles.th, flex:0.8}}>File</div>
      </div>
      {versions.length === 0 ? (
        <div style={styles.noResults}>No version history found</div>
      ) : versions.map((v, i) => (
        <div key={i} style={styles.tableRow}>
          <div style={{...styles.td, flex:1}}>
            <span style={{...styles.badge2, background:'#EFF6FF', color:'#1A3A6B'}}>v{v.version}</span>
          </div>
          <div style={{...styles.td, flex:2}}>
            <span style={styles.tdMuted}>{v.notes || 'No notes'}</span>
          </div>
          <div style={{...styles.td, flex:1.5}}>
            <span style={styles.tdMuted}>{new Date(v.upload_date).toLocaleDateString()}</span>
          </div>
          <div style={{...styles.td, flex:0.8}}>
            {v.file_path ? (
              <a href={`https://dop-portal-production.up.railway.app/uploads/${v.file_path}`} target="_blank" rel="noreferrer">
                <button style={styles.viewBtn}>View</button>
              </a>
            ) : (
              <span style={styles.tdMuted}>No file</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA', overflow:'hidden' },
  sidebar:       { width:'168px', background:'#122951', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarLogo:   { padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'10px' },
  logoRow:       { display:'flex', gap:'6px', marginBottom:'8px' },
  badge:         { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  logoTitle:     { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:       { color:'rgba(255,255,255,0.4)', fontSize:'9px' },
  navItem:       { display:'flex', alignItems:'center', padding:'9px 16px', margin:'1px 8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  navActive:     { background:'rgba(37,99,235,0.35)', color:'#fff' },
  sidebarFooter: { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' },
  avatar:        { width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  userName:      { color:'#fff', fontSize:'11px', fontWeight:'600' },
  userRole:      { color:'rgba(255,255,255,0.45)', fontSize:'9px' },
  main:          { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:        { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:   { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:     { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:   { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:      { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  rolePill:      { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:       { flex:1, overflowY:'auto', padding:'18px 22px' },
  pageHeader:    { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:     { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:       { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:        { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  addForm:       { background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'10px' },
  input:         { padding:'9px 12px', borderRadius:'8px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none' },
  statRow:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  searchWrap:    { marginBottom:'12px' },
  searchInput:   { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', background:'#fff' },
  tabs:          { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content', flexWrap:'wrap' },
  tab:           { padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  docList:       { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  tableHeader:   { display:'flex', alignItems:'center', padding:'10px 16px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' },
  th:            { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:      { display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #F8FAFC', cursor:'pointer' },
  td:            { display:'flex', alignItems:'center', gap:'6px', paddingRight:'8px' },
  docIcon:       { fontSize:'16px', flexShrink:0 },
  docName:       { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  catBadge:      { fontSize:'9px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px', background:'#EFF6FF', color:'#1A3A6B' },
  tdText:        { fontSize:'11px', color:'#475569', fontWeight:'500' },
  tdMuted:       { fontSize:'10px', color:'#94A3B8' },
  badge2:        { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  viewBtn:       { background:'#EFF6FF', color:'#1A3A6B', border:'1px solid #BFDBFE', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', fontWeight:'600', cursor:'pointer' },
  dlBtn:         { background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'12px', cursor:'pointer' },
  noResults:     { padding:'30px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
  versionPanel:  { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', marginTop:'14px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  versionHeader: { padding:'14px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  versionTitle:  { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'2px' },
};

export default Documents;