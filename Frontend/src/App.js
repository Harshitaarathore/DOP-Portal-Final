import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './pages/ProtectedRoute';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';
import SuccessPage from './pages/SuccessPage';

import SecretaryDashboard from './pages/SecretaryDashboard';
import Calendar from './pages/Calendar';
import Requests from './pages/Requests';
import Tasks from './pages/Tasks';
import Visitors from './pages/Visitors';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import DirectorDashboard from './pages/DirectorDashboard';
import DirectorRequests from './pages/DirectorRequests';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyRequests from './pages/FacultyRequests';
import FacultyCalendar from './pages/FacultyCalendar';
import StaffPortal from './pages/StaffPortal';
import VisitorPage from './pages/VisitorPage';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import VisitorRegister from './pages/VisitorRegister';
import Announcements from './pages/Announcements';
import AuditLogs from './pages/AuditLogs';
import Communications from './pages/Communications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                 element={<Login />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/otp"              element={<OTPVerification />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/success"          element={<SuccessPage />} />
        <Route path="/visitor-register" element={<VisitorRegister />} />

        {/* Secretary only */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Secretary']}><SecretaryDashboard /></ProtectedRoute>} />
        <Route path="/requests"  element={<ProtectedRoute allowedRoles={['Secretary']}><Requests /></ProtectedRoute>} />

        {/* Secretary + Director */}
        <Route path="/calendar"   element={<ProtectedRoute allowedRoles={['Secretary','Director']}><Calendar /></ProtectedRoute>} />
        <Route path="/tasks"      element={<ProtectedRoute allowedRoles={['Secretary','Director','Staff','Faculty']}><Tasks /></ProtectedRoute>} />
        <Route path="/visitors"   element={<ProtectedRoute allowedRoles={['Secretary','Director']}><Visitors /></ProtectedRoute>} />
        <Route path="/documents"  element={<ProtectedRoute allowedRoles={['Secretary','Director','Staff','Faculty']}><Documents /></ProtectedRoute>} />
        <Route path="/reports"    element={<ProtectedRoute allowedRoles={['Secretary','Director']}><Reports /></ProtectedRoute>} />
        <Route path="/settings"   element={<ProtectedRoute allowedRoles={['Secretary','Director','Staff','Faculty']}><Settings /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['Secretary','Director']}><AuditLogs /></ProtectedRoute>} />

        {/* Director only */}
        <Route path="/director-dashboard" element={<ProtectedRoute allowedRoles={['Director']}><DirectorDashboard /></ProtectedRoute>} />
        <Route path="/director-requests"  element={<ProtectedRoute allowedRoles={['Director']}><DirectorRequests /></ProtectedRoute>} />

        {/* Staff */}
        <Route path="/staff-portal" element={<ProtectedRoute allowedRoles={['Staff']}><StaffPortal /></ProtectedRoute>} />

        {/* Faculty */}
        <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={['Faculty']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty-requests"  element={<ProtectedRoute allowedRoles={['Faculty']}><FacultyRequests /></ProtectedRoute>} />
        <Route path="/faculty-calendar"  element={<ProtectedRoute allowedRoles={['Faculty']}><FacultyCalendar /></ProtectedRoute>} />

        {/* Visitor */}
        <Route path="/visitor-dashboard" element={<ProtectedRoute allowedRoles={['Visitor']}><VisitorPage /></ProtectedRoute>} />

        {/* All logged in */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/communications" element={<ProtectedRoute allowedRoles={['Secretary','Director']}><Communications /></ProtectedRoute>} />

        {/* 404 - must be LAST */}
        <Route path="*" element={<NotFound />} />

        

      </Routes> 
    </BrowserRouter>
  );
}

export default App;