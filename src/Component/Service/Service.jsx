import React from "react";
import "./Service.css";
import serviceImg1 from "../../assets/images1.jpg";
import serviceImg2 from "../../assets/images2.jpg";
import serviceImg3 from "../../assets/image3.jpg";
import serviceImg4 from "../../assets/images4.jpg";
import serviceImg5 from "../../assets/images5.jpg";
import serviceImg6 from "../../assets/images6.jpg";

const Service = () => {
  const services = [
    {
      title: "Emergency Plumbing Repairs",
      description: "24/7 emergency response for urgent plumbing issues including burst pipes, major leaks, and system failures.",
      image: serviceImg1,
    },
    {
      title: "Water Heater Services",
      description: "Installation, repair, and maintenance of all types of water heaters including tankless, traditional, and solar systems.",
      image: serviceImg2,
    },
    {
      title: "Drain & Sewer Cleaning",
      description: "Professional drain cleaning using advanced equipment to clear clogs and prevent future blockages.",
      image: serviceImg3,
    },
    {
      title: "Kitchen Plumbing",
      description: "Complete kitchen plumbing services including sink installation, garbage disposal, and dishwasher hookups.",
      image: serviceImg4,
    },
    {
      title: "Bathroom Plumbing",
      description: "Full bathroom plumbing services from fixture installation to complete bathroom remodels.",
      image: serviceImg5,
    },
    {
      title: "Pipe Repair & Replacement",
      description: "Expert pipe repair and replacement services using modern techniques and durable materials.",
      image: serviceImg6,
    },
  ];

  return (
    <div className="service-page">
      <section className="service-hero">
        <h1>Our Plumbing Services</h1>
        <p>
          Comprehensive plumbing solutions for residential and commercial properties.
          Professional service you can trust.
        </p>
      </section>

      <section className="services-list">
        <div className="services-container">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-item-image">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service-item-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button className="service-btn">Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Service;
