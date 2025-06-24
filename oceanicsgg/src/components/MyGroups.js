import React, { useEffect, useState } from 'react';

function MyGroups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Fetch groups from backend
    fetch('http://localhost:3001/groups') // You need to implement this GET endpoint in your backend!
      .then(res => res.json())
      .then(data => setGroups(data.groups || []));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Select a Group</h2>
      {groups.map(group => (
        <button key={group.id} className="btn" style={{ margin: '10px' }}>
          {group.name}
        </button>
      ))}
    </div>
  );
}

export default MyGroups;