import React from "react";
import { NavLink } from "react-router-dom";
import "./Home.css";
import heroImage from "../../assets/images10.jpg";
import img1 from "../../assets/images1.jpg";
import img2 from "../../assets/images2.jpg";
import img3 from "../../assets/image3.jpg";
import img4 from "../../assets/images4.jpg";

const Home = () => {
  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">24/7 Emergency Plumbing</span>
          <h1>
            Reliable Plumbing
            <br />
            Services For Your Home
          </h1>
          <p>
            From leaks and clogs to full system installations, our certified
            technicians keep your water flowing smoothly and safely.
          </p>
          <div className="hero-actions">
            <NavLink to="/book-online" className="btn-primary">Book Online</NavLink>
            <button className="btn-outline">View All Services</button>
          </div>

          <div className="hero-meta">
            <div>
              <h3>25+</h3>
              <p>Years of experience</p>
            </div>
            <div>
              <h3>4.9k</h3>
              <p>Happy customers</p>
            </div>
            <div>
              <h3>120+</h3>
              <p>Projects every month</p>
            </div>
          </div>
        </div>

        <div className="hero-highlight">
          <img src={heroImage} alt="Plumber at work" className="hero-photo" />

          <div className="hero-card">
            <h3>Need help right now?</h3>
            <p>Call our emergency line for immediate plumbing support.</p>
            <a href="tel:+18001234567" className="hero-phone">
              +1 (800) 123‑4567
            </a>
            <span className="hero-availability">We’re available 24/7</span>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services">
        <div className="section-header">
          <span className="section-kicker">Our Services</span>
          <h2>Professional Plumbing Solutions</h2>
          <p>
            A complete range of residential and commercial plumbing services
            tailored to your needs.
          </p>
        </div>

        <div className="services-grid">
          <article className="service-card">
            <img src={img1} alt="Emergency Repairs" className="service-image" />
            <h3>Emergency Repairs</h3>
            <p>
              Rapid response for burst pipes, major leaks, and other urgent
              issues—day or night.
            </p>
          </article>

          <article className="service-card">
            <img src={img2} alt="Water Heater Installations" className="service-image" />
            <h3>Water Heater Installations</h3>
            <p>
              Energy‑efficient water heater installation, repair, and routine
              maintenance.
            </p>
          </article>

          <article className="service-card">
            <img src={img3} alt="Drain & Sewer Cleaning" className="service-image" />
            <h3>Drain & Sewer Cleaning</h3>
            <p>
              Advanced equipment to clear stubborn clogs and keep your drains
              running freely.
            </p>
          </article>

          <article className="service-card">
            <img src={img4} alt="Kitchen & Bathroom Plumbing" className="service-image" />
            <h3>Kitchen & Bathroom Plumbing</h3>
            <p>
              From fixture upgrades to full remodel plumbing, we handle it all
              with care.
            </p>
          </article>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="video-section">
        <div className="video-container">
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Plumbing Services Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-content">
            <span className="section-kicker">Watch Our Work</span>
            <h2>See Our Plumbing Services In Action</h2>
            <p>
              Watch our expert technicians at work, providing professional plumbing
              solutions with precision and care. See why thousands of customers trust
              us for their plumbing needs.
            </p>
            <NavLink to="/book-online" className="btn-primary">
              Book Online Now
            </NavLink>
          </div>
        </div>
      </section>

      {/* ABOUT / WHY CHOOSE US SECTION */}
      <section className="about-strip">
        <div className="about-text">
          <span className="section-kicker light">Why Choose Us</span>
          <h2>Trusted Local Plumbing Experts</h2>
          <p>
            We combine experienced technicians, transparent pricing, and
            guaranteed workmanship to deliver a smooth experience from the first
            call to the final inspection.
          </p>
          <ul>
            <li>Fully licensed and insured technicians</li>
            <li>Upfront, honest pricing with no hidden fees</li>
            <li>Modern tools and techniques for long‑lasting repairs</li>
          </ul>
        </div>

        <div className="about-stats">
          <div className="stat-card">
            <h3>98%</h3>
            <p>Customer satisfaction rate</p>
          </div>
          <div className="stat-card">
            <h3>30 min</h3>
            <p>Average response time</p>
          </div>
          <div className="stat-card">
            <h3>10k+</h3>
            <p>Completed plumbing jobs</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
