import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Communications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [communications, setCommunications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComm, setNewComm] = useState({ type: 'email', sender: '', subject: '', content: '', tagged_as: '', direction: 'inward' });
  const role = localStorage.getItem('role');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchCommunications();
  }, [activeFilter]);

  const fetchCommunications = async () => {
    try {
      let url = '/communications';
      if (activeFilter !== 'all') url += `?status=${activeFilter}`;
      const res = await API.get(url);
      if (res.data.success) setCommunications(res.data.data);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await API.put(`/communications/${id}/status`, { status });
      if (res.data.success) {
        fetchCommunications();
        setSelected(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAdd = async () => {
    if (!newComm.sender || !newComm.subject) { alert('Sender and subject required'); return; }
    try {
      const res = await API.post('/communications', newComm);
      if (res.data.success) {
        alert('Communication logged!');
        setShowAddForm(false);
        setNewComm({ type: 'email', sender: '', subject: '', content: '', tagged_as: '', direction: 'inward' });
        fetchCommunications();
      }
    } catch (err) {
      alert('Failed to log communication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this communication?')) return;
    try {
      const res = await API.delete(`/communications/${id}`);
      if (res.data.success) { fetchCommunications(); setSelected(null); }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const stBg = { open: '#DBEAFE', pending: '#FEF3C7', closed: '#DCFCE7' };
  const stColor = { open: '#1E40AF', pending: '#92400E', closed: '#166534' };
  const typeBg = { email: '#EDE9FE', letter: '#FEF3C7' };
  const typeColor = { email: '#5B21B6', letter: '#92400E' };
  const tagBg = { urgent: '#FEE2E2', academic: '#DBEAFE', admin: '#DCFCE7', external: '#EDE9FE' };
  const tagColor = { urgent: '#991B1B', academic: '#1E40AF', admin: '#166534', external: '#5B21B6' };

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
          <div style={styles.logoTitle}>Director's Office Portal</div>
          <div style={styles.logoSub}>Director's Office</div>
        </div>
        {[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Requests', path: '/requests' },
          { label: 'Documents', path: '/documents' },
          { label: 'Visitors', path: '/visitors' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Communication', path: '/communications' },
          { label: 'Reports', path: '/reports' },
          { label: 'Settings', path: '/settings' },
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {})}}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={lnmiitLogo} alt="LNMIIT" style={styles.topbarLogo} />
            <div>
              <div style={styles.topbarTitle}>Director's Office Portal — LNMIIT</div>
              <div style={styles.topbarSub}>{today}</div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <button style={styles.logoutTopBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📬 Communication Hub</div>
              <div style={styles.pageSub}>Incoming → Logged → Tagged → Assigned → Closed</div>
            </div>
            <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>+ Log Communication</button>
          </div>

          {/* ADD FORM */}
          {showAddForm && (
            <div style={styles.addForm}>
              <div style={styles.formRow}>
                <select style={styles.input} value={newComm.type} onChange={e => setNewComm({ ...newComm, type: e.target.value })}>
                  <option value="email">Email</option>
                  <option value="letter">Letter</option>
                </select>
                <select style={styles.input} value={newComm.direction} onChange={e => setNewComm({ ...newComm, direction: e.target.value })}>
                  <option value="inward">Inward</option>
                  <option value="outward">Outward</option>
                </select>
                <select style={styles.input} value={newComm.tagged_as} onChange={e => setNewComm({ ...newComm, tagged_as: e.target.value })}>
                  <option value="">Tag as...</option>
                  <option value="urgent">Urgent</option>
                  <option value="academic">Academic</option>
                  <option value="admin">Admin</option>
                  <option value="external">External</option>
                </select>
              </div>
              <input style={styles.input} placeholder="Sender / From *" value={newComm.sender} onChange={e => setNewComm({ ...newComm, sender: e.target.value })} />
              <input style={styles.input} placeholder="Subject *" value={newComm.subject} onChange={e => setNewComm({ ...newComm, subject: e.target.value })} />
              <textarea style={{ ...styles.input, height: '60px', resize: 'vertical' }} placeholder="Content/Notes" value={newComm.content} onChange={e => setNewComm({ ...newComm, content: e.target.value })} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.addBtn} onClick={handleAdd}>Save</button>
                <button style={{ ...styles.addBtn, background: '#64748B' }} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              { label: 'Total', num: communications.length, bg: '#EFF6FF', color: '#1A3A6B' },
              { label: 'Open', num: communications.filter(c => c.status === 'open').length, bg: '#DBEAFE', color: '#1E40AF' },
              { label: 'Pending', num: communications.filter(c => c.status === 'pending').length, bg: '#FEF3C7', color: '#92400E' },
              { label: 'Closed', num: communications.filter(c => c.status === 'closed').length, bg: '#DCFCE7', color: '#166534' },
            ].map((s, i) => (
              <div key={i} style={{ ...styles.statCard, background: s.bg }}>
                <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={styles.tabs}>
            {['all', 'open', 'pending', 'closed'].map(f => (
              <div key={f}
                style={{ ...styles.tab, ...(activeFilter === f ? styles.tabActive : {}) }}
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </div>
            ))}
          </div>

          {/* LAYOUT */}
          <div style={styles.layout}>
            {/* LEFT - LIST */}
            <div style={styles.listPanel}>
              {loading ? (
                <div style={styles.emptyMsg}>Loading...</div>
              ) : communications.length === 0 ? (
                <div style={styles.emptyMsg}>No communications found</div>
              ) : communications.map((c, i) => (
                <div key={i}
                  style={{ ...styles.commCard, ...(selected?.id === c.id ? styles.commCardActive : {}) }}
                  onClick={() => setSelected(c)}
                >
                  <div style={styles.commTop}>
                    <div style={{ ...styles.typeBadge, background: typeBg[c.type], color: typeColor[c.type] }}>
                      {c.type === 'email' ? '📧' : '📄'} {c.type}
                    </div>
                    <span style={{ ...styles.badge2, background: stBg[c.status], color: stColor[c.status] }}>{c.status}</span>
                  </div>
                  <div style={styles.commSubject}>{c.subject}</div>
                  <div style={styles.commSender}>From: {c.sender}</div>
                  <div style={styles.commMeta}>
                    {c.tagged_as && <span style={{ ...styles.badge2, background: tagBg[c.tagged_as] || '#EFF6FF', color: tagColor[c.tagged_as] || '#1A3A6B' }}>{c.tagged_as}</span>}
                    <span style={styles.commDate}>{new Date(c.date).toLocaleDateString()}</span>
                    <span style={{ ...styles.badge2, background: '#F8FAFC', color: '#64748B' }}>{c.direction}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT - DETAIL */}
            <div style={styles.detailPanel}>
              {selected ? (
                <>
                  <div style={styles.detailHeader}>
                    <div style={{ ...styles.typeBadge, background: typeBg[selected.type], color: typeColor[selected.type], fontSize: '12px', padding: '6px 14px' }}>
                      {selected.type === 'email' ? '📧 Email' : '📄 Letter'}
                    </div>
                    <span style={{ ...styles.badge2, background: stBg[selected.status], color: stColor[selected.status] }}>{selected.status}</span>
                  </div>

                  <div style={styles.detailSubject}>{selected.subject}</div>

                  {[
                    { label: 'From', value: selected.sender },
                    { label: 'Date', value: new Date(selected.date).toLocaleString() },
                    { label: 'Direction', value: selected.direction },
                    { label: 'Tagged', value: selected.tagged_as || 'None' },
                  ].map((row, i) => (
                    <div key={i} style={styles.detailRow}>
                      <span style={styles.detailLabel}>{row.label}</span>
                      <span style={styles.detailValue}>{row.value}</span>
                    </div>
                  ))}

                  {selected.content && (
                    <div style={styles.detailContent}>
                      <div style={styles.detailLabel}>Content</div>
                      <div style={styles.contentText}>{selected.content}</div>
                    </div>
                  )}

                  {/* STATUS ACTIONS */}
                  <div style={styles.actionRow}>
                    {selected.status !== 'open' && (
                      <button style={{ ...styles.actionBtn, background: '#DBEAFE', color: '#1E40AF' }} onClick={() => handleStatusUpdate(selected.id, 'open')}>Mark Open</button>
                    )}
                    {selected.status !== 'pending' && (
                      <button style={{ ...styles.actionBtn, background: '#FEF3C7', color: '#92400E' }} onClick={() => handleStatusUpdate(selected.id, 'pending')}>Mark Pending</button>
                    )}
                    {selected.status !== 'closed' && (
                      <button style={{ ...styles.actionBtn, background: '#DCFCE7', color: '#166534' }} onClick={() => handleStatusUpdate(selected.id, 'closed')}>Mark Closed</button>
                    )}
                    {role === 'Director' && (
                      <button style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#991B1B' }} onClick={() => handleDelete(selected.id)}>Delete</button>
                    )}
                  </div>
                </>
              ) : (
                <div style={styles.noSelection}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📬</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>Select a communication</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Click any item to view details</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#F0F4FA', overflow: 'hidden' },
  sidebar: { width: '168px', background: '#122951', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' },
  logoRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
  badge: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px' },
  logoTitle: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: '9px' },
  navItem: { display: 'flex', alignItems: 'center', padding: '9px 16px', margin: '1px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  navActive: { background: 'rgba(37,99,235,0.35)', color: '#fff' },
  sidebarFooter: { marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userName: { color: '#fff', fontSize: '11px', fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.45)', fontSize: '9px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#1A3A6B', padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { color: '#fff', fontSize: '14px', fontWeight: '700' },
  topbarSub: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '1px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  notifBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  rolePill: { background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  content: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  pageTitle: { fontSize: '16px', fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
  addBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  addForm: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  formRow: { display: 'flex', gap: '10px' },
  input: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' },
  statCard: { borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' },
  statNum: { fontSize: '22px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: '#64748B', fontWeight: '500' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '14px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', width: 'fit-content' },
  tab: { padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#64748B', cursor: 'pointer' },
  tabActive: { background: '#1A3A6B', color: '#fff' },
  layout: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' },
  listPanel: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' },
  commCard: { background: '#fff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  commCardActive: { border: '2px solid #2563EB', background: '#EFF6FF' },
  commTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  typeBadge: { fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px' },
  commSubject: { fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '3px' },
  commSender: { fontSize: '10px', color: '#64748B', marginBottom: '6px' },
  commMeta: { display: 'flex', alignItems: 'center', gap: '6px' },
  commDate: { fontSize: '9px', color: '#94A3B8' },
  badge2: { fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px', flexShrink: 0 },
  detailPanel: { background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' },
  detailSubject: { fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '14px' },
  detailRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' },
  detailLabel: { fontSize: '11px', color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: '11px', color: '#1E293B', fontWeight: '500' },
  detailContent: { marginTop: '14px' },
  contentText: { fontSize: '11px', color: '#475569', lineHeight: 1.7, marginTop: '6px', background: '#F8FAFC', padding: '12px', borderRadius: '8px' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' },
  actionBtn: { padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  noSelection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' },
  emptyMsg: { padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' },
  logoutTopBtn: { background: '#DC2626', border: 'none', borderRadius: '8px', padding: '6px 14px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
  topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
  topbarSub: { color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' },
};

export default Communications;