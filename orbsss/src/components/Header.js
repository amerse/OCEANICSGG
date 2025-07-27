import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ loggedIn, onSignOut }) {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      background: 'transparent',
      padding: '1rem 2rem',
      pointerEvents: 'none'
    }}>
      {loggedIn && (
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          onClick={() => navigate('/homepage')}
          aria-label="Home"
          title="Home"
        >
          🏠
        </button>
      )}
      {loggedIn && (
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            color: '#d11a2a',
            fontWeight: 'bold',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
          onClick={onSignOut}
          aria-label="Log Out"
          title="Log Out"
        >
          Log Out
        </button>
      )}
    </div>
  );
}

export default Header;