import React from 'react';
import './FooterOne.css';

import image0 from '../../assets/images.png';
import image1 from '../../assets/images1.jpg'
import image2 from '../../assets/images2.jpg'
import image3 from '../../assets/image3.jpg'
import image4 from '../../assets/images4.jpg'
import image5 from '../../assets/images5.jpg'
import image6 from '../../assets/images6.jpg'
import image7 from '../../assets/images7.jpg'
import image8 from '../../assets/images8.jpg'
import image9 from '../../assets/images9.jpg'



import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa';

const FooterOne = () => {
  return (
    <footer className="footer-grid-wrapper">

      {/* COLUMN 1 */}
      <div className="footer-column">
        <img src={image0} alt="Plumco Logo" className="footer-logo" />

        <p>
          Management Plumbing includes a broad range of activities, and the many firms
          and their members often define these practices.
        </p>

        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* COLUMN 2 */}
      <div className="footer-column">
        <h5>Contact</h5>
        <p> Green Lake Street</p>
        <p>Crawfordsville, IN 47933</p>
        <p> +1 800 123 456 789Plumco@gmail.com</p>
      </div>

      {/* COLUMN 3 */}
      <div className="footer-column">
        <h3>Services</h3>
        <ul>
          <li>Kitchen Plumbing</li>
          <li>Gas Line Services</li>
          <li>Water Line Repair</li>
          <li>Bathroom Plumbing</li>
          <li>Basement Plumbing</li>
        </ul>
      </div>

      {/* COLUMN 4 */}
      <div className="footer-column">
        <h3>Projects</h3>
        <div className="footer-images">
          {[image1, image2, image3, image4, image5, image6, image7, image8, image9].map(
            (img, i) => (
              <img key={i} src={img} alt={`Project ${i + 1}`} />
            )
          )}
        </div>
      </div>

    </footer>
  );
};

export default FooterOne;
