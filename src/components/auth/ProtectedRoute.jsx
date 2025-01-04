import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const verificationTimer = useRef(null);

  // Effect to periodically verify token
  useEffect(() => {
    if (!user) return;

    const verifyToken = async () => {
      const isValid = await checkAuth(true);
      if (!isValid) {
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    // Initial verification with delay to prevent immediate check
    const initialTimeout = setTimeout(() => {
      verifyToken();
    }, 1000);

    // Set up interval for periodic checks (every 5 minutes)
    verificationTimer.current = setInterval(verifyToken, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (verificationTimer.current) {
        clearInterval(verificationTimer.current);
      }
    };
  }, [checkAuth, navigate, location, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimer.current) {
        clearInterval(verificationTimer.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

