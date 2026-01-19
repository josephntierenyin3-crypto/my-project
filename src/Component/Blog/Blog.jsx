import React from "react";
import "./Blog.css";
import blogImg1 from "../../assets/images7.jpg";
import blogImg2 from "../../assets/images8.jpg";
import blogImg3 from "../../assets/images9.jpg";
import blogImg4 from "../../assets/images10.jpg";

const Blog = () => {
  const blogPosts = [
    {
      title: "How to Prevent Common Plumbing Issues",
      date: "January 15, 2024",
      excerpt: "Learn about the most common plumbing problems and how to prevent them before they become costly repairs.",
      image: blogImg1,
    },
    {
      title: "Water Heater Maintenance Tips",
      date: "January 10, 2024",
      excerpt: "Keep your water heater running efficiently with these simple maintenance tips that can extend its lifespan.",
      image: blogImg2,
    },
    {
      title: "When to Call a Professional Plumber",
      date: "January 5, 2024",
      excerpt: "Not sure if you need professional help? Here's a guide to help you decide when to DIY and when to call the experts.",
      image: blogImg3,
    },
    {
      title: "Modern Plumbing Solutions for Your Home",
      date: "December 28, 2023",
      excerpt: "Discover the latest plumbing technologies and innovations that can improve your home's efficiency and comfort.",
      image: blogImg4,
    },
  ];

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Our Latest Plumbing Insights</h1>
        <p>
          Expert advice, maintenance tips, and industry insights to help you keep
          your plumbing system in top condition.
        </p>
      </section>

      <section className="blog-posts">
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <article key={index} className="blog-card">
              <div className="blog-image">
                <img src={post.image} alt={post.title} />
              </div>
              <div className="blog-content">
                <span className="blog-date">{post.date}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a href="#" className="read-more">Read More →</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
