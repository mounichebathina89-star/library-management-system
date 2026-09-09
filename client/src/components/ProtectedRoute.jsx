import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = null 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
