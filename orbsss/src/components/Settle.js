import React, { useEffect, useState } from 'react';

function Settle() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);

  // Fetch all groups on mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    fetch(`http://localhost:3001/groups?userId=${userId}`)
      .then(res => res.json())
      .then(data => setGroups(data));
  }, []);

  // Fetch members and expenses when group is selected
  useEffect(() => {
    if (!selectedGroup) return;
    fetch(`http://localhost:3001/groups/${selectedGroup.id}/members`)
      .then(res => res.json())
      .then(data => setMembers(data));
    fetch(`http://localhost:3001/groups/${selectedGroup.id}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data));
  }, [selectedGroup]);

  // Calculate settlements when members and expenses are loaded
  useEffect(() => {
    if (members.length === 0 || expenses.length === 0) {
      setSettlements([]);
      return;
    }
    const memberNames = members.map(m => m.member_name);
    const balances = {};
    memberNames.forEach(name => { balances[name] = 0; });

    // Calculate net balance for each member
    expenses.forEach(exp => {
      const split = memberNames.length;
      const share = Number(exp.cost) / split;
      memberNames.forEach(name => {
        balances[name] -= share;
      });
      balances[exp.payer] += Number(exp.cost);
    });

    // Minimum cash flow algorithm
    const settlementsArr = [];
    const names = [...memberNames];
    const getMax = obj => names.reduce((a, b) => obj[a] > obj[b] ? a : b);
    const getMin = obj => names.reduce((a, b) => obj[a] < obj[b] ? a : b);

    function settleRec(bal) {
      const mx = getMax(bal);
      const mn = getMin(bal);
      if (Math.abs(bal[mx]) < 0.01 && Math.abs(bal[mn]) < 0.01) return;
      const amount = Math.min(-bal[mn], bal[mx]);
      if (amount > 0.01) {
        settlementsArr.push({
          from: mn,
          to: mx,
          amount: Math.round(amount * 100) / 100
        });
        bal[mx] -= amount;
        bal[mn] += amount;
        settleRec(bal);
      }
    }
    settleRec({ ...balances });
    setSettlements(settlementsArr);
  }, [members, expenses]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      {!selectedGroup ? (
        <>
          <h2>Select a Group</h2>
          {groups.length === 0 && <p>No groups found.</p>}
          <div>
            {groups.map(group => (
              <div key={group.id} style={{ position: 'relative', display: 'inline-block', margin: '10px' }}>
                <button
                  className="glow-btn"
                  style={{ minWidth: '160px', fontSize: '1.1rem' }}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group.name || group.group_name}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3>{selectedGroup.group_name}</h3>
          <h4 style={{ marginTop: '2rem' }}>Settlement Instructions</h4>
          {settlements.length === 0 ? (
            <div style={{ marginTop: '1rem' }}>Everyone is settled up! 🎉</div>
          ) : (
            <>
              <table style={{ margin: '1rem auto', fontSize: '1.2rem' }}>
                <tbody>
                  {settlements.map((s, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: 8 }}>{s.from}</td>
                      <td style={{ padding: '0 8px' }}>pays</td>
                      <td style={{ textAlign: 'left', fontWeight: 'bold', paddingRight: 8 }}>{s.to}</td>
                      <td style={{ padding: '0 8px' }}>${s.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                  className="glow-btn"
                  style={{ minWidth: '160px', fontSize: '1.1rem' }}
                  onClick={() => {
                    setSelectedGroup(null);
                    setSettlements([]);
                    setExpenses([]);
                    setMembers([]);
                  }}
                >
                  Settled!
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Settle;