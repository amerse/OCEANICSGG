import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import CreateGroup from './CreateGroup'; // Make sure this file exists

function Homepage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2>Welcome, {username ? username : 'Guest'}!</h2>
      <Button onClick={() => setShowCreateGroup(true)}>Create a Group</Button>
      <Button onClick={() => navigate('/mygroups')}>Log Expenses</Button>
      <Button>Settle UP</Button>

      {showCreateGroup && (
        <div className="modal">
          <div className="modal-content">
            <CreateGroup
              onCancel={() => setShowCreateGroup(false)}
              onSuccess={() => setShowCreateGroup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;