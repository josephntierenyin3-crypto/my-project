import React from "react";
import "./About.css";
import aboutImg1 from "../../assets/images5.jpg";
import aboutImg2 from "../../assets/images6.jpg";
import aboutImg3 from "../../assets/images7.jpg";

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">About Us</span>
          <h1>Your Trusted Plumbing Experts</h1>
          <p>
            With over 25 years of experience, we've been serving homeowners and businesses
            with reliable, professional plumbing services. Our team of certified technicians
            is committed to delivering quality workmanship and exceptional customer service.
          </p>
        </div>
        <div className="about-hero-image">
          <img src={aboutImg1} alt="Plumbing team" />
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission-content">
          <h2>Our Mission</h2>
          <p>
            To provide exceptional plumbing services that exceed customer expectations
            while maintaining the highest standards of quality, integrity, and professionalism.
            We believe in building lasting relationships with our clients through trust and
            reliability.
          </p>
        </div>
        <div className="about-mission-images">
          <img src={aboutImg2} alt="Mission" />
          <img src={aboutImg3} alt="Values" />
        </div>
      </section>

      <section className="about-values">
        <h2>Why Choose Us</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Licensed & Insured</h3>
            <p>All our technicians are fully licensed and insured for your peace of mind.</p>
          </div>
          <div className="value-card">
            <h3>24/7 Availability</h3>
            <p>Emergency plumbing services available around the clock, every day of the year.</p>
          </div>
          <div className="value-card">
            <h3>Quality Guarantee</h3>
            <p>We stand behind our work with comprehensive warranties and satisfaction guarantees.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
