import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { VaultProvider } from './contexts/VaultContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import VaultDetails from './pages/VaultDetails';
import ShareVault from './pages/ShareVault';
import Invitations from './pages/Invitations';
import Settings from './pages/Settings';
import Tags from './pages/Tags';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNavigation from './components/BottomNavigation';
import GlobalModals from './components/GlobalModals';
import Legal from './pages/Legal';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import SupportPage from './pages/SupportPage';

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Navigate to="/dashboard" /> : <LandingPage />}
        />
        <Route
          path="/support"
          element={<SupportPage />}
        />
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={currentUser ? <Navigate to="/dashboard" /> : <SignupPage />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/legal"
          element={<Legal />}
        />
        <Route
          path="/legal/terms-and-conditions"
          element={<TermsAndConditions />}
        />
        <Route
          path="/legal/privacy-policy"
          element={<PrivacyPolicy />}
        />
        <Route
          path="/legal/delete-account"
          element={<DeleteAccount />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault/:id"
          element={
            <ProtectedRoute>
              <VaultDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault/:id/share"
          element={
            <ProtectedRoute>
              <ShareVault />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tags"
          element={
            <ProtectedRoute>
              <Tags />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNavigation />
      <GlobalModals />
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <VaultProvider>
              <AppRoutes />
            </VaultProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
