const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Oceanicsgg',
  password: 'blazingtornado',
  port: 5432,
});

console.log("LOADED: /Users/amerse/Documents/orbs/oceanicsgg/src/backend/server.js");

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: err.message }); 
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];
    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Return the username as well
    res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create group endpoint
app.post('/groups', async (req, res) => {
  const { groupName, members, userId } = req.body;
  try {
    const groupResult = await pool.query(
      'INSERT INTO groups (name, user_id) VALUES ($1, $2) RETURNING id',
      [groupName, userId]
    );
    const groupId = groupResult.rows[0].id;
    for (const member of members) {
      await pool.query(
        'INSERT INTO group_members (group_id, member_name, user_id) VALUES ($1, $2, $3)',
        [groupId, member.name, member.userId]
      );
    }
    res.status(201).json({ message: 'Group created', groupId });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get groups endpoint
app.get('/groups', async (req, res) => {
  const userId = req.query.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM groups WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete group endpoint
app.delete('/groups/:id', async (req, res) => {
  const groupId = req.params.id;
  try {
    await pool.query('DELETE FROM group_members WHERE group_id = $1', [groupId]);
    await pool.query('DELETE FROM groups WHERE id = $1', [groupId]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get group members
app.get('/groups/:id/members', async (req, res) => {
  const groupId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1',
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log an expense
app.post('/expenses', async (req, res) => {
  const { groupId, category, description, cost, payer, splits } = req.body;
  try {
    const expenseResult = await pool.query(
      'INSERT INTO expenses (group_id, category, description, cost, payer) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [groupId, category, description, cost, payer]
    );
    const expenseId = expenseResult.rows[0].id;
    // Store custom splits
    if (splits && Array.isArray(splits)) {
      for (const split of splits) {
        await pool.query(
          'INSERT INTO expense_members (expense_id, member_name, share) VALUES ($1, $2, $3)',
          [expenseId, split.member_name, split.share]
        );
      }
    }
    res.status(201).json({ message: 'Expense logged', expenseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expenses for a group
app.get('/groups/:id/expenses', async (req, res) => {
  const groupId = req.params.id;
  try {
    const expensesResult = await pool.query(
      'SELECT * FROM expenses WHERE group_id = $1 ORDER BY created_at DESC',
      [groupId]
    );
    const expenses = expensesResult.rows;

    for (const exp of expenses) {
      const splitsResult = await pool.query(
        'SELECT member_name, share FROM expense_members WHERE expense_id = $1',
        [exp.id]
      );
      exp.splits = splitsResult.rows;
    }

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an expense
app.delete('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;
  try {
    // First, delete splits for this expense
    await pool.query('DELETE FROM expense_members WHERE expense_id = $1', [expenseId]);
    // Then, delete the expense itself
    await pool.query('DELETE FROM expenses WHERE id = $1', [expenseId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reminders
app.get('/reminders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Get all groups where user is a member
    const groupsResult = await pool.query(
      `SELECT g.id, g.name
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`, [userId]
    );
    const groups = groupsResult.rows;

    const reminders = [];

    for (const group of groups) {
      // Get all members for this group
      const membersResult = await pool.query(
        'SELECT member_name, user_id FROM group_members WHERE group_id = $1',
        [group.id]
      );
      const members = membersResult.rows;

      // Get all expenses for this group
      const expensesResult = await pool.query(
        'SELECT * FROM expenses WHERE group_id = $1',
        [group.id]
      );
      const expenses = expensesResult.rows;

      // Add this block to fetch splits for each expense:
      for (const exp of expenses) {
        const splitsResult = await pool.query(
          'SELECT member_name, share FROM expense_members WHERE expense_id = $1',
          [exp.id]
        );
        exp.splits = splitsResult.rows;
      }

      // Find the logged-in user's member_name in this group
      const myMember = members.find(m => m.user_id === userId);
      if (!myMember) continue;

      // --- Settlement Calculation (same as Settle.js) ---
      const memberNames = members.map(m => m.member_name);
      const balances = {};
      memberNames.forEach(name => { balances[name] = 0; });

      expenses.forEach(exp => {
        if (exp.splits && exp.splits.length > 0) {
          exp.splits.forEach(split => {
            balances[split.member_name] -= Number(split.share);
          });
        } else {
          // fallback to equal split if no custom splits
          const split = memberNames.length;
          const share = Number(exp.cost) / split;
          memberNames.forEach(name => {
            balances[name] -= share;
          });
        }
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

      // Find who the user owes and who owes the user
      const owesMe = [];
      const iOwe = [];
      settlementsArr.forEach(s => {
        if (s.from === myMember.member_name) {
          iOwe.push({ name: s.to, amount: s.amount });
        } else if (s.to === myMember.member_name) {
          owesMe.push({ name: s.from, amount: s.amount });
        }
      });

      reminders.push({
        groupName: group.name,
        owesMe,
        iOwe
      });
    }

    res.json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("=== THIS IS THE CORRECT SERVER.JS ===");
});
