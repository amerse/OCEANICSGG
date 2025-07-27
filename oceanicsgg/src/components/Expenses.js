import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const categories = [
  { name: 'Food', icon: '🍔' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Misc', icon: '🧩' }
];

function Expenses() {
  const { groupId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [payer, setPayer] = useState(members[0]?.member_name || '');
  const [amount, setAmount] = useState('');
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [customShares, setCustomShares] = useState({});
  const [splitEqually, setSplitEqually] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, splits: [] });
  const plusRef = useRef(null);

  // fetch group members
  useEffect(() => {
    fetch(`http://localhost:3001/groups/${groupId}/members`)
      .then(res => res.json())
      .then(data => {
        setMembers(data);
        if (data.length > 0) {
          setPayer(data[0].member_name); // set default payer to first member
        }
      });
  }, [groupId]);

  // fetch expenses for history
  const fetchExpenses = () => {
    fetch(`http://localhost:3001/groups/${groupId}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data));
  };

  const openModal = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
    setSelectedMembers([]);
    setDescription('');
    setCost('');
    setSuccess('');
    setAmount('');
  };

  const handleCheckbox = (member) => {
    setSelectedMembers(prev =>
      prev.includes(member)
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !cost) {
      setSuccess('Please fill all fields.');
      return;
    }

    // only check custom split sum if not splitting equally
    if (!splitEqually) {
      const totalSplit = members.reduce(
        (sum, member) => sum + Number(customShares[member.member_name] || 0),
        0
      );
      if (Math.abs(totalSplit - parseFloat(cost)) > 0.01) {
        setSuccess('Custom split amounts must add up to the total cost.');
        return;
      }
    }

    const splits = members.map(member => ({
      member_name: member.member_name,
      share: Number(customShares[member.member_name] || 0)
    }));

    const res = await fetch(`http://localhost:3001/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        category: selectedCategory,
        description,
        cost: parseFloat(cost),
        payer,
        splits
      })
    });
    if (res.ok) {
      setSuccess('Expense logged successfully!');
      fetchExpenses();
      setTimeout(() => setShowModal(false), 1200);
    } else {
      setSuccess('Failed to log expense.');
    }
  };

  // show history modal and fetch expenses
  const handleShowHistory = () => {
    fetchExpenses();
    setShowHistory(true);
  };

  const handleDeleteExpense = (id) => {
    setExpenseToDelete(id);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    await fetch(`http://localhost:3001/expenses/${expenseToDelete}`, {
      method: 'DELETE'
    });
    setExpenseToDelete(null);
    fetchExpenses();
  };

  useEffect(() => {
    if (splitEqually && cost && members.length > 0) {
      const equalShare = (parseFloat(cost) / members.length) || 0;
      const newShares = {};
      members.forEach(member => {
        newShares[member.member_name] = equalShare.toFixed(2);
      });
      setCustomShares(newShares);
    }
  }, [splitEqually, cost, members]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <h2>Log an Expense</h2>
      <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0' }}>
        {categories.map(cat => (
          <button
            key={cat.name}
            style={{
              fontSize: '2rem',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: '#e0e5fa',
              cursor: 'pointer',
              boxShadow: '0 0 10px #e0e5fa'
            }}
            onClick={() => openModal(cat.name)}
          >
            <div>{cat.icon}</div>
            <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{cat.name}</div>
          </button>
        ))}
      </div>
      {/* Centered History Icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={handleShowHistory}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer'
          }}
          aria-label="Show expense history"
          title="Show expense history"
        >
          🕑
        </button>
        <div style={{ fontSize: '1rem', marginTop: '0.2rem', color: '#333' }}>
          History
        </div>
      </div>
      {/* Expense Modal */}
      {showModal && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '2rem', borderRadius: '1rem', minWidth: '320px'
          }}>
            <h3>{selectedCategory} Expense</h3>
            <form onSubmit={handleSubmit}>
              <label>Who paid?</label>
              <select
                className="group-input"
                value={payer}
                onChange={e => setPayer(e.target.value)}
                required
              >
                {members.map(m => (
                  <option key={m.id || m.member_name} value={m.member_name}>{m.member_name}</option>
                ))}
              </select>
              <label>Description:</label>
              <input
                className="group-input"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              <label>Cost:</label>
              <input
                className="group-input"
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                required
                style={{ width: '100%', marginBottom: '1rem' }}
                min="0"
                step="0.01"
              />
              <label>Custom Split:</label>
              {members.map(member => (
                <div key={member.member_name} style={{ marginBottom: '0.5rem' }}>
                  <span>{member.member_name}:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customShares[member.member_name] || ''}
                    onChange={e =>
                      setCustomShares(cs => ({
                        ...cs,
                        [member.member_name]: e.target.value
                      }))
                    }
                    style={{ marginLeft: '1rem', width: '80px' }}
                    placeholder="0.00"
                    disabled={splitEqually}
                  />
                </div>
              ))}
              <label>
                <input
                  type="checkbox"
                  checked={splitEqually}
                  onChange={e => {
                    setSplitEqually(e.target.checked);
                    if (!e.target.checked) setCustomShares({});
                  }}
                  style={{ marginRight: '0.5rem' }}
                />
                Split Equally?
              </label>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button type="submit" className="btn">Log Expense</button>
                <button type="button" className="btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
              <div style={{ marginTop: '1rem', color: 'green' }}>{success}</div>
            </form>
          </div>
        </div>
      )}
      {/* History Modal */}
      {showHistory && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            minWidth: '420px',
            maxWidth: '90vw',
            maxHeight: '70vh',
            overflow: 'hidden', 
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Expense History</h3>
              <button
                onClick={() => setShowDelete(v => !v)}
                style={{
                  background: showDelete ? '#d11a2a' : 'none',
                  color: showDelete ? 'white' : '#d11a2a',
                  border: 'none',
                  fontSize: '1.5rem',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer'
                }}
                title={showDelete ? "Disable delete mode" : "Enable delete mode"}
                aria-label="Toggle delete mode"
              >
                🗑️
              </button>
            </div>
            {expenses.length === 0 ? (
              <p>No expenses logged yet.</p>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem 1rem' }}>Category</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem 1rem' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem 1rem' }}>Payer</th>
                      <th style={{ padding: '0.5rem 1rem', width: '120px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                          Cost
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ textAlign: 'left', padding: '0.5rem 1rem' }}>{exp.category}</td>
                        <td style={{ textAlign: 'center', padding: '0.5rem 1rem' }}>{exp.description}</td>
                        <td style={{ textAlign: 'center', padding: '0.5rem 1rem' }}>{exp.payer}</td>
                        <td style={{ padding: '0.5rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', position: 'relative' }}>
                            ${exp.cost}
                            {exp.splits && exp.splits.length > 0 && (
                              <span
                                ref={plusRef}
                                style={{
                                  marginLeft: '0.5rem',
                                  cursor: 'pointer',
                                  color: '#1a7f37',
                                  fontWeight: 'bold',
                                  position: 'relative',
                                  display: 'inline-block'
                                }}
                                tabIndex={0}
                                onMouseEnter={e => {
                                  const rect = e.target.getBoundingClientRect();
                                  setTooltip({
                                    visible: true,
                                    x: rect.right + 8, // 8px to the right of the +
                                    y: rect.top,
                                    splits: exp.splits
                                  });
                                }}
                                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                                onFocus={e => {
                                  const rect = e.target.getBoundingClientRect();
                                  setTooltip({
                                    visible: true,
                                    x: rect.right + 8,
                                    y: rect.top,
                                    splits: exp.splits
                                  });
                                }}
                                onBlur={() => setTooltip({ ...tooltip, visible: false })}
                              >
                                +
                              </span>
                            )}
                            {showDelete && (
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                style={{
                                  marginLeft: '1rem',
                                  background: 'none',
                                  border: 'none',
                                  color: '#d11a2a',
                                  fontSize: '1.5rem',
                                  cursor: 'pointer',
                                  verticalAlign: 'middle'
                                }}
                                title="Delete expense"
                              >
                                ❌
                              </button>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn cancel" onClick={() => setShowHistory(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {expenseToDelete && (
        <div className="modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '2rem', borderRadius: '1rem', minWidth: '320px'
          }}>
            <h3>Delete Expense</h3>
            <p>Are you sure you want to delete this expense?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn cancel" onClick={() => setExpenseToDelete(null)}>Cancel</button>
              <button className="btn" style={{ background: '#d11a2a', color: 'white' }} onClick={confirmDeleteExpense}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: '#fff',
            color: '#222',
            border: '1px solid #eee',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            padding: '0.5rem 1rem',
            zIndex: 99999,
            whiteSpace: 'normal',
            minWidth: '120px',
            maxWidth: '240px',
            textAlign: 'left',
            pointerEvents: 'auto'
          }}
        >
          <strong>Custom Split:</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {tooltip.splits.map((split, idx) => (
              <li key={idx}>
                {split.member_name}: ${Number(split.share).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Expenses;