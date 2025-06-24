import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateGroup({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pax, setPax] = useState('');
  const [names, setNames] = useState([]);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');

  // Step 1: Enter number of people
  const handlePaxSubmit = e => {
    e.preventDefault();
    const num = parseInt(pax, 10);
    if (isNaN(num) || num < 1) {
      setError('Please enter a valid number greater than 0.');
      return;
    }
    setNames(Array(num).fill(''));
    setStep(2);
    setError('');
  };

  // Step 2: Enter names
  const handleNameChange = (idx, value) => {
    const updated = [...names];
    updated[idx] = value;
    setNames(updated);
  };

  const handleNamesSubmit = async e => {
    e.preventDefault();
    if (names.some(name => !name.trim())) {
      setError('All names are required.');
      return;
    }
    // Send to backend
    const res = await fetch('http://localhost:3001/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupName, names }),
    });
    if (res.ok) {
      alert('Group created successfully!');
      if (onSuccess) onSuccess();
      navigate('/homepage'); // Redirect to homepage
    } else {
      alert('Failed to create group.');
    }
  };

  return (
    <div className="form-container">
      {step === 1 && (
        <form onSubmit={handlePaxSubmit}>
          <label>Group Name:</label>
          <input
            className="group-input"
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
          <label>How many people are in the group?</label>
          <input
            className="group-input"
            type="number"
            min="1"
            value={pax}
            onChange={e => setPax(e.target.value.replace(/\D/,''))}
            required
          />
          <button type="submit" className="btn">Next</button>
          <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
          {error && <div style={{color:'red'}}>{error}</div>}
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleNamesSubmit}>
          <label>Enter the names of the people in your group:</label>
          {names.map((name, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Person ${idx + 1} Name`}
              value={name}
              onChange={e => handleNameChange(idx, e.target.value)}
              required
            />
          ))}
          <button type="submit" className="btn">Create Group</button>
          <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
          {error && <div style={{color:'red'}}>{error}</div>}
        </form>
      )}
    </div>
  );
}

export default CreateGroup;