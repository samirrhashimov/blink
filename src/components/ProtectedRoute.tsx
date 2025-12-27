import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if email is verified (only for email/password users, not Google)
  // We bypass this for the Firefox reviewer's test account
  const isTestAccount = auth.currentUser?.email === 'test@example.com';

  if (auth.currentUser && !auth.currentUser.emailVerified && auth.currentUser.providerData[0]?.providerId === 'password' && !isTestAccount) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
