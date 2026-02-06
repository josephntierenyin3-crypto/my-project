import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const register = authContext?.register;

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // default role
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    setMessage('');
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match');
      return;
    }

    if (!register) {
      setError('Registration service is not available. Please refresh the page.');
      return;
    }

    try {
      const result = await register(form.username, form.email, form.password, form.role);
      
      if (result && result.success) {
        setMessage(`User Registered Successfully as ${form.role}! Redirecting...`);
        setForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
        });
        setTimeout(() => {
          navigate(result.user?.role === 'admin' ? '/admin' : '/user');
        }, 1500);
      } else {
        setError(result?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="registration-container">
      <p className="app-title">GoodDay — Work Management</p>
      <h2>Registration</h2>

      <form className="registration-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Role selection */}
        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={form.role === 'admin'}
              onChange={handleChange}
            />
            Admin
          </label>

          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={form.role === 'user'}
              onChange={handleChange}
            />
            User
          </label>
        </div>

        <button type="submit">Register</button>

        <div className="account">
          Have an account? <Link to="/login">Login</Link>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Registration;
