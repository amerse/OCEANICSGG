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
    res.status(500).json({ error: err.message }); // Send error message to frontend
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
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create group endpoint
app.post('/groups', async (req, res) => {
  const { groupName, names } = req.body;
  try {
    console.log('Registering /groups endpoint');
    const groupResult = await pool.query(
      'INSERT INTO groups (name) VALUES ($1) RETURNING id',
      [groupName]
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("=== THIS IS THE CORRECT SERVER.JS ===");
});
