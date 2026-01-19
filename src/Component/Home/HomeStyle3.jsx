import React from "react";
import "./Home.css";
import heroImage from "../../assets/images6.jpg";
import img1 from "../../assets/images1.jpg";
import img2 from "../../assets/images2.jpg";
import img3 from "../../assets/images4.jpg";
import img4 from "../../assets/images10.jpg";

const HomeStyle3 = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Residential & Commercial</span>
          <h1>
            Plumbing Experts
            <br />
            You Can Rely On
          </h1>
          <p>
            Same site, different homepage layout — this is Home Style 3. We’ll
            keep improving it to match the Plumco template.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Call Now</button>
            <button className="btn-outline">Our Projects</button>
          </div>
        </div>

        <div className="hero-highlight">
          <img src={heroImage} alt="Professional plumber" className="hero-photo" />
        </div>
      </section>

      <section className="services">
        <div className="section-header">
          <span className="section-kicker">Popular</span>
          <h2>Plumbing Services</h2>
          <p>Quick overview of our core services.</p>
        </div>

        <div className="services-grid">
          <article className="service-card">
            <img src={img1} alt="Emergency" className="service-image" />
            <h3>Emergency</h3>
            <p>24/7 response for urgent plumbing problems.</p>
          </article>
          <article className="service-card">
            <img src={img2} alt="Water Heater" className="service-image" />
            <h3>Water Heater</h3>
            <p>Installations and repairs for all systems.</p>
          </article>
          <article className="service-card">
            <img src={img3} alt="Drain" className="service-image" />
            <h3>Drain</h3>
            <p>Cleaning and unclogging with modern tools.</p>
          </article>
          <article className="service-card">
            <img src={img4} alt="Installations" className="service-image" />
            <h3>Installations</h3>
            <p>Fixtures, pipes, and full system installs.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HomeStyle3;

