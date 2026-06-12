import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Visitors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name: '', organization: '', purpose: '', visit_date: '', visit_time: '' });
  const role = localStorage.getItem('role');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      let res;
      if (role === 'Secretary' || role === 'Director') {
        res = await API.get('/visitors/today');
      } else {
        res = await API.get('/visitors/today');
      }
      if (res.data.success) setVisitors(res.data.data);
    } catch (err) {
      console.log('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/visitors/${id}/approve`);
      if (res.data.success) {
        alert('Visitor approved and pass generated!');
        fetchVisitors();
        setSelectedVisitor(null);
      }
    } catch (err) {
      alert('Failed to approve visitor');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };


  const handleReject = async (id) => {
    try {
      const res = await API.put(`/visitors/${id}/reject`);
      if (res.data.success) {
        alert('Visitor rejected!');
        fetchVisitors();
        setSelectedVisitor(null);
      }
    } catch (err) {
      alert('Failed to reject visitor');
    }
  };

  const handleAddVisitor = async () => {
    if (!newVisitor.name || !newVisitor.purpose || !newVisitor.visit_date) {
      alert('Please fill in all required fields');
      return;
    }

    // block past dates on frontend too
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visitD = new Date(newVisitor.visit_date);
    if (visitD < today) {
      alert('Visit date cannot be in the past');
      return;
    }

    try {
      const res = await API.post('/visitors/request', newVisitor);
      if (res.data.success) {
        alert('Visitor request submitted!');
        setShowAddForm(false);
        setNewVisitor({ name: '', organization: '', purpose: '', visit_date: '' });
        fetchVisitors();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to submit visitor request');
    }
  };

  const filtered = activeTab === 'all' ? visitors :
    activeTab === 'approved' ? visitors.filter(v => v.approval_status === 'Approved') :
      activeTab === 'pending' ? visitors.filter(v => v.approval_status === 'Pending') :
        visitors.filter(v => v.approval_status === 'Rejected');

  const stBg = { Approved: '#DCFCE7', Pending: '#FEF3C7', Rejected: '#FEE2E2' };
  const stColor = { Approved: '#166534', Pending: '#92400E', Rejected: '#991B1B' };

  const handlePrintPass = (visitor) => {
    const passContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .pass { border: 3px solid #1A3A6B; border-radius: 12px; padding: 30px; max-width: 400px; margin: auto; }
        .header { background: #1A3A6B; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; }
        .sub { font-size: 12px; opacity: 0.8; margin-top: 4px; }
        .field { margin-bottom: 12px; }
        .label { font-size: 11px; color: #64748B; font-weight: bold; text-transform: uppercase; }
        .value { font-size: 14px; color: #1E293B; font-weight: 600; margin-top: 2px; }
        .badge { background: #DCFCE7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 16px; }
        .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="pass">
        <div class="header">
          <div class="title">LNMIIT — Entry Pass</div>
          <div class="sub">Director's Office Portal</div>
        </div>
        <div class="field">
          <div class="label">Visitor Name</div>
          <div class="value">${visitor.name}</div>
        </div>
        <div class="field">
          <div class="label">Organization</div>
          <div class="value">${visitor.organization || 'N/A'}</div>
        </div>
        <div class="field">
          <div class="label">Purpose of Visit</div>
          <div class="value">${visitor.purpose}</div>
        </div>
        <div class="field">
          <div class="label">Visit Date</div>
          <div class="value">${new Date(new Date(visitor.visit_date).getTime() + new Date(visitor.visit_date).getTimezoneOffset() * 60000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div class="field">
          <div class="label">Visit Time</div>
          <div class="value">${visitor.visit_time || '10:00'}</div>
        </div>
        <div class="badge">✓ APPROVED</div>
        <div class="footer">
          This pass is valid for the mentioned date only.<br/>
          Issued by: Director's Office, LNMIIT Jaipur
        </div>
      </div>
    </body>
    </html>
  `;
    const win = window.open('', '_blank');
    win.document.write(passContent);
    win.document.close();
    win.print();
  };

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
          { label: 'Communication', path: '/communications' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Reports', path: '/reports' },
          { label: 'Settings', path: '/settings' },
        ].map((item, i) => (
          <div key={i}
            style={{ ...styles.navItem, ...(i === 4 ? styles.navActive : {}) }}
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
              <div style={styles.pageTitle}>👥 Visitors</div>
              <div style={styles.pageSub}>Manage and track all visitor appointments</div>
            </div>
            <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>+ Add Visitor</button>
          </div>

          {/* ADD VISITOR FORM */}
          {showAddForm && (
            <div style={styles.addForm}>
              <input style={styles.input} placeholder="Visitor name *" value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} />
              <input style={styles.input} placeholder="Organization" value={newVisitor.organization} onChange={e => setNewVisitor({ ...newVisitor, organization: e.target.value })} />
              <input style={styles.input} placeholder="Purpose of visit *" value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} />
              <input style={styles.input} type="date" value={newVisitor.visit_date} onChange={e => setNewVisitor({ ...newVisitor, visit_date: e.target.value })} />
              <input style={styles.input} type="time" value={newVisitor.visit_time || ''} onChange={e => setNewVisitor({ ...newVisitor, visit_time: e.target.value })} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.addBtn} onClick={handleAddVisitor}>Submit</button>
                <button style={{ ...styles.addBtn, background: '#64748B' }} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              { label: 'Total', num: visitors.length, bg: '#EFF6FF', color: '#1A3A6B' },
              { label: 'Approved', num: visitors.filter(v => v.approval_status === 'Approved').length, bg: '#DCFCE7', color: '#166534' },
              { label: 'Pending', num: visitors.filter(v => v.approval_status === 'Pending').length, bg: '#FEF3C7', color: '#92400E' },
              { label: 'Rejected', num: visitors.filter(v => v.approval_status === 'Rejected').length, bg: '#FEE2E2', color: '#991B1B' },
            ].map((s, i) => (
              <div key={i} style={{ ...styles.statCard, background: s.bg }}>
                <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            {['all', 'approved', 'pending', 'rejected'].map(tab => (
              <div key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* LAYOUT */}
          <div style={styles.layout}>
            {/* LEFT - VISITOR LIST */}
            <div style={styles.listPanel}>
              {loading ? (
                <div style={styles.emptyMsg}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div style={styles.emptyMsg}>No visitors found for today</div>
              ) : filtered.map(v => (
                <div key={v.id}
                  style={{ ...styles.visitorCard, ...(selectedVisitor?.id === v.id ? styles.visitorCardActive : {}) }}
                  onClick={() => setSelectedVisitor(v)}
                >
                  <div style={styles.visitorTop}>
                    <div style={{ ...styles.visitorAvatar, background: '#1A3A6B' }}>
                      {v.name ? v.name[0].toUpperCase() : 'V'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.visitorName}>{v.name}</div>
                      <div style={styles.visitorOrg}>{v.organization}</div>
                    </div>
                    <span style={{ ...styles.badge2, background: stBg[v.approval_status], color: stColor[v.approval_status] }}>{v.approval_status}</span>
                  </div>
                  <div style={styles.visitorMid}>
                    <span style={styles.visitorPurpose}>{v.purpose}</span>
                  </div>
                  <div style={styles.visitorDate}>
                    📅 {v.visit_date ? new Date(new Date(v.visit_date).getTime() + new Date(v.visit_date).getTimezoneOffset() * 60000).toLocaleDateString() : 'No date'}
                    &nbsp;|&nbsp; 🎫 Pass: {v.pass_generated ? 'Generated' : 'Not generated'}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT - VISITOR DETAIL */}
            <div style={styles.detailPanel}>
              {selectedVisitor ? (
                <>
                  <div style={styles.detailHeader}>
                    <div style={{ ...styles.visitorAvatar, width: '44px', height: '44px', fontSize: '14px', background: '#1A3A6B' }}>
                      {selectedVisitor.name ? selectedVisitor.name[0].toUpperCase() : 'V'}
                    </div>
                    <div>
                      <div style={styles.detailName}>{selectedVisitor.name}</div>
                      <div style={styles.detailOrg}>{selectedVisitor.organization}</div>
                    </div>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Purpose</span>
                    <span style={styles.detailValue}>{selectedVisitor.purpose}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Visit Date</span>
                    <span style={styles.detailValue}>{selectedVisitor.visit_date ? new Date(new Date(selectedVisitor.visit_date).getTime() + new Date(selectedVisitor.visit_date).getTimezoneOffset() * 60000).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Visit Time</span>
                    <span style={styles.detailValue}>{selectedVisitor.visit_time || '10:00'}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Status</span>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Status</span>
                    <span style={{ ...styles.badge2, background: stBg[selectedVisitor.approval_status], color: stColor[selectedVisitor.approval_status] }}>{selectedVisitor.approval_status}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Pass Generated</span>
                    <span style={styles.detailValue}>{selectedVisitor.pass_generated ? '✅ Yes' : '❌ No'}</span>
                  </div>

                  {selectedVisitor.approval_status === 'Pending' && (role === 'Secretary' || role === 'Director') && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button style={styles.approveBtn} onClick={() => handleApprove(selectedVisitor.id)}>✓ Approve & Generate Pass</button>
                      <button style={styles.rejectBtn} onClick={() => handleReject(selectedVisitor.id)}>✗ Reject</button>
                    </div>
                  )}

                  {selectedVisitor.approval_status === 'Approved' && selectedVisitor.pass_generated && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', fontSize: '11px', color: '#166534', marginBottom: '10px' }}>
                        ✅ Visitor approved. Entry pass has been generated.
                      </div>
                      <button style={{ background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                        onClick={() => handlePrintPass(selectedVisitor)}>
                        🖨️ Print Entry Pass
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.noSelection}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>Select a visitor</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Click any visitor to view details</div>
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
  input: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' },
  statCard: { borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' },
  statNum: { fontSize: '22px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: '#64748B', fontWeight: '500' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '14px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', width: 'fit-content' },
  tab: { padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#64748B', cursor: 'pointer' },
  tabActive: { background: '#1A3A6B', color: '#fff' },
  layout: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' },
  listPanel: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' },
  visitorCard: { background: '#fff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  visitorCardActive: { border: '2px solid #2563EB', background: '#EFF6FF' },
  visitorTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  visitorAvatar: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  visitorName: { fontSize: '12px', fontWeight: '700', color: '#1E293B' },
  visitorOrg: { fontSize: '10px', color: '#94A3B8' },
  visitorMid: { marginBottom: '6px' },
  visitorPurpose: { fontSize: '11px', color: '#475569' },
  visitorDate: { fontSize: '10px', color: '#94A3B8' },
  badge2: { fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px', flexShrink: 0 },
  detailPanel: { background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' },
  detailName: { fontSize: '14px', fontWeight: '700', color: '#1E293B' },
  detailOrg: { fontSize: '11px', color: '#94A3B8', marginTop: '2px' },
  detailRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFC' },
  detailLabel: { fontSize: '11px', color: '#64748B', fontWeight: '600' },
  detailValue: { fontSize: '11px', color: '#1E293B', fontWeight: '500' },
  approveBtn: { flex: 1, background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  rejectBtn: { flex: 1, background: '#991B1B', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  noSelection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' },
  emptyMsg: { padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' },
  logoutTopBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#FCA5A5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
  topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
  topbarSub: { color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' },
};

export default Visitors;