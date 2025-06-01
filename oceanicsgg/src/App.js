import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Quote from './components/Quote';
import Button from './components/Button';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="App">
      <Welcome />
      <Quote />
      <Button onClick={() => setShowLogin(true)}>Log In</Button>
      <Button onClick={() => setShowSignup(true)}>Sign Up</Button>

      {showLogin && (
        <div className="modal">
          <div className="modal-content">
            <Login onCancel={() => setShowLogin(false)} />
          </div>
        </div>
      )}

      {showSignup && (
        <div className="modal">
          <div className="modal-content">
            <Signup onCancel={() => setShowSignup(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
