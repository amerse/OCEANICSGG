import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Quote from './components/Quote';
import Button from './components/Button';
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './components/Homepage';
import MyGroups from './components/MyGroups';
import Expenses from './components/Expenses';
import Settle from './components/Settle';
import Header from './components/Header';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('username'));

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setLoggedIn(true);
    window.location.href = "/homepage";
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setLoggedIn(true);
    window.location.href = "/homepage";
  };

  const handleSignOut = () => {
    localStorage.removeItem('username');
    setLoggedIn(false);
    window.location.href = "/";
  };

  const Landing = () => (
    <>
      <Welcome />
      <Quote />
      <Button onClick={() => setShowLogin(true)}>Log In</Button>
      <Button onClick={() => setShowSignup(true)}>Sign Up</Button>
    </>
  );

  return (
    <Router>
      <Header loggedIn={loggedIn} onSignOut={handleSignOut} />
      <div className="App">
        {showLogin && (
          <div className="modal">
            <div className="modal-content">
              <Login onCancel={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
            </div>
          </div>
        )}

        {showSignup && (
          <div className="modal">
            <div className="modal-content">
              <Signup onCancel={() => setShowSignup(false)} onSuccess={handleSignupSuccess} />
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/mygroups" element={<MyGroups />} />
          <Route path="/expenses/:groupId" element={<Expenses />} />
          <Route path="/settle" element={<Settle />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
