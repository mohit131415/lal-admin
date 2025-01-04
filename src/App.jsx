import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import Login from '@/components/auth/Login';
import ForgotPassword from '@/components/auth/ForgotPassword';
import Dashboard from '@/components/dashboard/Dashboard';
import BlogPosts from '@/components/blog/BlogPosts';
import ContactResponses from '@/components/contact/ContactResponses';
import Resources from '@/components/resources/Resources';
import Newsletter from '@/components/newsletter/Newsletter';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public route component - redirects to dashboard if already authenticated
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/auth/forgot-password" element={
          <PublicRoute>
            <ForgotPassword isPublic={true} />
          </PublicRoute>
        } />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="blog-posts" element={<BlogPosts />} />
          <Route path="contact-responses" element={<ContactResponses />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="resources" element={<Resources />} />
          <Route path="settings/forgot-password" element={<ForgotPassword isPublic={false} />} />
        </Route>

        {/* Catch all route - redirect to dashboard if authenticated, login if not */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
