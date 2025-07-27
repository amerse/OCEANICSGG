import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './glowbtn.css';

function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    fetch(`http://localhost:3001/groups?userId=${userId}`)
      .then(res => res.json())
      .then(data => setGroups(data));
  }, []);

  const handleDelete = async (groupId) => {
    const res = await fetch(`http://localhost:3001/groups/${groupId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setGroups(groups.filter(g => g.id !== groupId));
      setConfirmDelete(null);
    } else {
      alert('Failed to delete group.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Delete mode toggle icon */}
      <button
        onClick={() => setDeleteMode(!deleteMode)}
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          background: 'none',
          border: 'none',
          fontSize: '1.3rem', 
          fontFamily: 'inherit', 
          cursor: 'pointer',
          zIndex: 10,
          color: '#222', 
          fontWeight: 'bold' 
        }}
        aria-label="Toggle delete mode"
        title="Delete Groups"
      >
        Edit
      </button>
      <h2>Select a Group</h2>
      {groups.length === 0 && <p>No groups found.</p>}
      <div>
        {groups.map(group => (
          <div key={group.id} style={{ position: 'relative', display: 'inline-block', margin: '10px' }}>
            <button
              className="glow-btn"
              style={{ minWidth: '160px', fontSize: '1.1rem' }}
              onClick={() => navigate(`/expenses/${group.id}`)}
            >
              {group.name}
            </button>
            {deleteMode && (
              <button
                onClick={() => setConfirmDelete(group.id)}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  zIndex: 1
                }}
                aria-label="Delete group"
                title="Delete group"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Confirmation Modal */}
      {confirmDelete !== null && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <p>Are you sure you want to delete this group?</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ background: 'gray', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGroups;