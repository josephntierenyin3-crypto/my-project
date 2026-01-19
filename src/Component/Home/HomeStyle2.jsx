import React from "react";
import "./Home.css";
import heroImage from "../../assets/images8.jpg";
import img1 from "../../assets/images5.jpg";
import img2 from "../../assets/images6.jpg";
import img3 from "../../assets/images7.jpg";
import img4 from "../../assets/images9.jpg";

const HomeStyle2 = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Trusted Plumbing Services</span>
          <h1>
            Fast, Friendly
            <br />
            Plumbing Solutions
          </h1>
          <p>
            Same great service — this is Home Style 2. Customize sections and
            colors later to match the template exactly.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Book Appointment</button>
            <button className="btn-outline">Get A Quote</button>
          </div>
        </div>

        <div className="hero-highlight">
          <img src={heroImage} alt="Plumbing service" className="hero-photo" />
        </div>
      </section>

      <section className="services">
        <div className="section-header">
          <span className="section-kicker">Featured Services</span>
          <h2>What We Do Best</h2>
          <p>Explore our most requested plumbing services.</p>
        </div>

        <div className="services-grid">
          <article className="service-card">
            <img src={img1} alt="Leak Detection" className="service-image" />
            <h3>Leak Detection</h3>
            <p>Find and fix leaks fast to prevent water damage.</p>
          </article>
          <article className="service-card">
            <img src={img2} alt="Pipe Repair" className="service-image" />
            <h3>Pipe Repair</h3>
            <p>Durable repairs and replacements for all pipe types.</p>
          </article>
          <article className="service-card">
            <img src={img3} alt="Drain Cleaning" className="service-image" />
            <h3>Drain Cleaning</h3>
            <p>Clear stubborn clogs and restore proper flow.</p>
          </article>
          <article className="service-card">
            <img src={img4} alt="Fixture Install" className="service-image" />
            <h3>Fixture Install</h3>
            <p>Upgrade faucets, sinks, toilets, and more.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HomeStyle2;

