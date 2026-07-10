import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // Wrong role → redirect to their own page
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'Director')       return <Navigate to="/director-dashboard" />;
    if (role === 'Secretary')      return <Navigate to="/dashboard" />;
    if (role === 'Faculty')        return <Navigate to="/faculty-requests" />;
    if (role === 'Visitor')        return <Navigate to="/visitor-dashboard" />;
    if (role === 'Staff')          return <Navigate to="/staff-portal" />;
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;