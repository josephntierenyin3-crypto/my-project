import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-nav">
          <span className="logo">GoodDay</span>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#views">Views</a>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">Sign up</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <p className="hero-tagline">True Collaboration · Full Customization · Strategic Alignment</p>
        <h1 className="hero-title">
          All Work. All Teams. <span className="highlight">One Place.</span>
        </h1>
        <p className="hero-subtitle">
          Manage all work and teams in one unified platform built for alignment, efficiency, and results.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn-hero">Get Started</Link>
          <Link to="/login" className="btn-outline">Login</Link>
        </div>
      </section>

      <section id="features" className="section features">
        <h2 className="section-title">A Complete Suite for Modern Work</h2>
        <p className="section-subtitle">
          From goals and reports to collaboration and automation — manage every aspect of work in one place.
        </p>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">📋</span>
            <h3>Workspaces & Projects</h3>
            <p>Organize work into workspaces and projects with unlimited hierarchy.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📌</span>
            <h3>List & Board Views</h3>
            <p>View tasks as a list or drag-and-drop Kanban board.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👤</span>
            <h3>My Work</h3>
            <p>See all tasks assigned to you in one dashboard.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Goals & Priorities</h3>
            <p>Set priorities, due dates, and track progress.</p>
          </div>
        </div>
      </section>

      <section id="views" className="section views-section">
        <h2 className="section-title">Multiple Views for Your Work</h2>
        <div className="views-grid">
          <div className="view-card">List</div>
          <div className="view-card">Board (Kanban)</div>
          <div className="view-card">My Work</div>
        </div>
      </section>

      <section className="section cta">
        <h2 className="section-title">Ready to Transform Your Workflow?</h2>
        <p className="section-subtitle">Join thousands of teams already working smarter.</p>
        <div className="cta-actions">
          <Link to="/register" className="btn-hero">Sign up for free</Link>
          <Link to="/login" className="btn-outline">Login</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="logo">GoodDay</span>
          <p>Work management for modern teams.</p>
          <div className="footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
