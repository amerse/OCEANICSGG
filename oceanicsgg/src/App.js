import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Quote from './components/Quote';
import Button from './components/Button';
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './components/Homepage';
import MyGroups from './components/MyGroups';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
      <div className="App">
        {showLogin && (
          <div className="modal">
            <div className="modal-content">
              <Login onCancel={() => setShowLogin(false)} onSuccess={() => {
                setShowLogin(false);
                window.location.href = "/homepage";
              }} />
            </div>
          </div>
        )}

        {showSignup && (
          <div className="modal">
            <div className="modal-content">
              <Signup onCancel={() => setShowSignup(false)} onSuccess={() => {
                setShowSignup(false);
                window.location.href = "/homepage";
              }} />
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/mygroups" element={<MyGroups />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
