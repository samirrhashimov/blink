import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ContainerProvider } from './contexts/ContainerContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import ContainerDetails from './pages/ContainerDetails';
import ShareContainer from './pages/ShareContainer';
import Requests from './pages/Requests';
import Settings from './pages/Settings';
import Tags from './pages/Tags';
import SharePage from './pages/SharePage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNavigation from './components/BottomNavigation';
import GlobalModals from './components/GlobalModals';
import SpotlightSearch from './components/SpotlightSearch';
import Legal from './pages/Legal';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import SupportPage from './pages/SupportPage';
import Profile from './pages/Profile';
import Paywall from './pages/Paywall';


const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <>
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
          path="/container/:id"
          element={<ContainerDetails />}
        />
        <Route
          path="/profile/:username"
          element={<Profile />}
        />

        <Route
          path="/share/:token"
          element={<SharePage />}
        />
        <Route
          path="/container/:id/share"
          element={
            <ProtectedRoute>
              <ShareContainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
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
        <Route
          path="/paywall"
          element={
            <ProtectedRoute>
              <Paywall />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNavigation />
      <GlobalModals />
      <SpotlightSearch />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ContainerProvider>
              <Router>
                <AppRoutes />
              </Router>
            </ContainerProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
