import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import CreateGroup from './CreateGroup';

function Homepage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3001/reminders/${userId}`)
        .then(res => res.json())
        .then(data => {
          setReminders(data);
          // only show if not already shown in this session
          if (
            !sessionStorage.getItem('reminderShown') &&
            data.some(group => group.owesMe.length > 0 || group.iOwe.length > 0)
          ) {
            setShowReminderModal(true);
            sessionStorage.setItem('reminderShown', 'true');
          }
        });
    }
  }, [userId]);

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
      <Button onClick={() => navigate('/settle')}>Settle UP</Button>
      <Button onClick={() => setShowReminderModal(true)}>O$P$</Button> {/* Add this line */}

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

      {showReminderModal && (
        <div className="modal">
          <div
            className="modal-content"
            style={{
              maxWidth: 900,
              minWidth: 700,
              display: 'flex',
              flexDirection: 'row',
              gap: '2rem',
              padding: '2.5rem 2rem'
            }}
          >
            {/* Left: You Owe */}
            <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '2rem' }}>
              <h3 style={{ textAlign: 'center', color: '#d11a2a' }}>You Owe</h3>
              {reminders.filter(group => group.iOwe.length > 0).length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>All settled up!</div>
              )}
              {reminders.map((group, idx) =>
                group.iOwe.length > 0 && (
                  <div key={idx} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: 8, color: '#333' }}>{group.groupName}</h4>
                    <ul style={{ marginLeft: 0, paddingLeft: 0, listStyle: 'none' }}>
                      {group.iOwe.map((item, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{item.name}</span> — ${item.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
            {/* Right: People Owe You */}
            <div style={{ flex: 1, paddingLeft: '2rem' }}>
              <h3 style={{ textAlign: 'center', color: '#1a7f37' }}>People Owe You</h3>
              {reminders.filter(group => group.owesMe.length > 0).length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>All settled up!</div>
              )}
              {reminders.map((group, idx) =>
                group.owesMe.length > 0 && (
                  <div key={idx} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: 8, color: '#333' }}>{group.groupName}</h4>
                    <ul style={{ marginLeft: 0, paddingLeft: 0, listStyle: 'none' }}>
                      {group.owesMe.map((item, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{item.name}</span> — ${item.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
            <button
              style={{
                position: 'absolute',
                top: 20,
                right: 30,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#333'
              }}
              onClick={() => setShowReminderModal(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;