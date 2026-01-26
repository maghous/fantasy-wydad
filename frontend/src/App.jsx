import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './context/useAuthStore';
import Login from './pages/Login';
import Leagues from './pages/Leagues';
import Matches from './pages/Matches';
import Predictions from './pages/Predictions';
import MyPredictions from './pages/MyPredictions';
import Rankings from './pages/Rankings';
import Admin from './pages/Admin';
import ScoringGuide from './pages/ScoringGuide';
import Profile from './pages/Profile';
import JoinLeague from './pages/JoinLeague';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Stats from './pages/Stats';
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated, loadUser, loading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-black uppercase tracking-widest animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/leagues" />}
          />
          <Route
            path="/leagues"
            element={isAuthenticated ? <Leagues /> : <Navigate to="/login" />}
          />
          <Route
            path="/matches/:leagueId"
            element={isAuthenticated ? <Matches /> : <Navigate to="/login" />}
          />
          <Route
            path="/predict/:matchId"
            element={isAuthenticated ? <Predictions /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-predictions/:leagueId"
            element={isAuthenticated ? <MyPredictions /> : <Navigate to="/login" />}
          />
          <Route
            path="/rankings/:leagueId"
            element={isAuthenticated ? <Rankings /> : <Navigate to="/login" />}
          />
          {/* Admin Route - Only for admins */}
          <Route
            path="/admin"
            element={isAuthenticated && useAuthStore.getState().user?.isAdmin ? <Admin /> : <Navigate to="/leagues" />}
          />
          <Route
            path="/scoring"
            element={isAuthenticated ? <ScoringGuide /> : <Navigate to="/login" />}
          />
          <Route
            path="/stats"
            element={isAuthenticated ? <Stats /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/league/join/:code"
            element={<JoinLeague />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/leagues" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
