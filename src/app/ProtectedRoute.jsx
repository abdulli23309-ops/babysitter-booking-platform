// ProtectedRoute — Phase F1
//
// DISCLAIMER (explicit, per Phase F1 spec):
// This is a UX-ONLY navigation guard. It prevents users from *navigating* to
// pages they should not see in the browser. It is NOT true backend security —
// the ASP.NET API remains fully callable by any client regardless of this
// wrapper. Real enforcement must be implemented server-side (deferred work).

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

/**
 * @param {string[]} allowedRoles - lowercase role strings exactly as stored
 *   ('parent' | 'babysitter'). Omit to allow any authenticated session.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { userId, role, loading } = useAuth();
  const location = useLocation();

  // 1) Session loading — render a minimal placeholder to prevent flicker.
  //    (Plain text on purpose: F1 must not add styles/UI redesigns.)
  if (loading) {
    return <div>Loading…</div>;
  }

  // 2) No session — redirect to login, preserving the intended destination.
  if (userId === null || !role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 3) Wrong role — redirect to the correct role's safe default dashboard.
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'babysitter' ? '/babysitter-dashboard' : '/parent-dashboard'} replace />;
  }

  // 4) Correct role (or no role restriction) — render the page.
  return children;
}
