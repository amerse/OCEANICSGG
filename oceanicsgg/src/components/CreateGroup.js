import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateGroup({ onCancel, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pax, setPax] = useState('');
  const [names, setNames] = useState([]);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(null);

  // enter number of people
  const handlePaxSubmit = e => {
    e.preventDefault();
    const num = parseInt(pax, 10);
    if (isNaN(num) || num < 1) {
      setError('Please enter a valid number greater than 0.');
      return;
    }
    if (num > 8) {
      setError('Maximum group size is 8.');
      return;
    }
    setNames(Array(num).fill(''));
    setStep(2);
    setError('');
  };

  // enter names
  const handleNameChange = (idx, value) => {
    const updated = [...names];
    updated[idx] = value;
    setNames(updated);
  };

  const handleNamesSubmit = async e => {
    e.preventDefault();

    // make sure member names are unique
    const trimmedNames = names.map(n => n.trim().toLowerCase());
    const nameSet = new Set(trimmedNames);
    if (nameSet.size !== trimmedNames.length) {
      setError('Member names must be unique.');
      return;
    }

    // make sure group names are unique
    const groupsRes = await fetch(`http://localhost:3001/groups?userId=${localStorage.getItem('user_id')}`);
    const groups = await groupsRes.json();
    const groupNameExists = groups.some(
      g => g.name.trim().toLowerCase() === groupName.trim().toLowerCase()
    );
    if (groupNameExists) {
      setError('Group name already exists. Please choose another name.');
      return;
    }

    const userId = localStorage.getItem('user_id');
    const membersWithUserId = names.map((name, idx) => ({
      name,
      userId: idx === selectedMemberIdx ? userId : null
    }));

    await fetch('http://localhost:3001/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupName,
        members: membersWithUserId,
        userId
      })
    });

    alert('Group created successfully!');
    if (onSuccess) onSuccess();
    navigate('/homepage');
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
          <label>How many people are in the group? (Max 8)</label>
          <input
            className="group-input"
            type="number"
            min="1"
            max="8"
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
          <label>Who are you in this group?</label>
          <select
          className='group-input'
            value={selectedMemberIdx ?? ""}
            onChange={e => setSelectedMemberIdx(Number(e.target.value))}
            required
          >
            <option value="" disabled>Select yourself</option>
            {names.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
          <button type="submit" className="btn">Create Group</button>
          <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
          {error && <div style={{color:'red'}}>{error}</div>}
        </form>
      )}
    </div>
  );
}

export default CreateGroup;