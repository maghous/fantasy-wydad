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
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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
