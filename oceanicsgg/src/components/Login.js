import React, { useState } from 'react';

function Login({ onCancel }) {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert('Login successful!');
      // Optionally redirect or set auth state here
    } else {
      alert('Login failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn">Log In</button>
      <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default Login;