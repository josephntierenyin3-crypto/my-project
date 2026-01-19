import React from "react";
import "./Contact.css";
import contactImg from "../../assets/download.jpg";

const Contact = () => {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Get In Touch</h1>
        <p>
          Have a plumbing question or need a quote? Contact us today and our
          team will be happy to help.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Tell us about your plumbing needs..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>

        <div className="contact-info-section">
          <div className="contact-image">
            <img src={contactImg} alt="Contact us" />
          </div>
          <div className="contact-details">
            <h2>Contact Information</h2>
            <div className="contact-item">
              <h3>Phone</h3>
              <p>+1 (800) 123-4567</p>
            </div>
            <div className="contact-item">
              <h3>Email</h3>
              <p>info@plumco.com</p>
            </div>
            <div className="contact-item">
              <h3>Address</h3>
              <p>
                Green Lake Street<br />
                Crawfordsville, IN 47933
              </p>
            </div>
            <div className="contact-item">
              <h3>Hours</h3>
              <p>
                Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 4:00 PM<br />
                Sunday: Emergency Service Only
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
