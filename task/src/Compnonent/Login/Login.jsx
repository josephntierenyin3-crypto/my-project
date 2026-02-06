import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const login = authContext?.login;

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'user', // default role
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Please enter email and password');
      return;
    }

    if (!login) {
      setError('Login service is not available. Please refresh the page.');
      return;
    }

    try {
      const result = await login(form.email, form.password, form.role);
      
      if (result && result.success) {
        if (result.user && result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      } else {
        setError(result?.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <p className="app-title">GoodDay — Work Management</p>
      <h2>Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

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

        <button type="submit">Login</button>

        <div className="info">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
