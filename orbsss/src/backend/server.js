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
  const { groupName, names, userId } = req.body;
  try {
    console.log('POST /groups called');
    const groupResult = await pool.query(
      'INSERT INTO groups (name, user_id) VALUES ($1, $2) RETURNING id',
      [groupName, userId]
    );
    const groupId = groupResult.rows[0].id;
    for (const name of names) {
      await pool.query(
        'INSERT INTO group_members (group_id, member_name) VALUES ($1, $2)',
        [groupId, name]
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
  const { groupId, category, description, cost, payer } = req.body;
  try {
    const expenseResult = await pool.query(
      'INSERT INTO expenses (group_id, category, description, cost, payer) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [groupId, category, description, cost, payer]
    );
    res.status(201).json({ message: 'Expense logged', expenseId: expenseResult.rows[0].id });
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
      const membersResult = await pool.query(
        'SELECT member_name FROM expense_members WHERE expense_id = $1',
        [exp.id]
      );
      exp.members = membersResult.rows.map(r => r.member_name);
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
    await pool.query('DELETE FROM expenses WHERE id = $1', [expenseId]);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("=== THIS IS THE CORRECT SERVER.JS ===");
});
