import React, { useState } from 'react';

function Signup({ onCancel, onSuccess }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      // Use the username field as user_id
      localStorage.setItem('username', form.username);
      localStorage.setItem('user_id', form.username);
      alert('Registration successful!');
      if (onSuccess) onSuccess();
    } else {
      alert('Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input name="username" type="text" placeholder="Username" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit" className="btn">Sign Up</button>
      <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default Signup;