import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Aundrae M Giles',
      rating: 5,
      text: "This shit is out of the world, compared to all the other AI apps out there, by far this one is so much more advanced!!! You want the real deal then look no further, you want to build yourself and grow as an individual then stop what your doing and take the 14 day free trial and explore everything you possibly can and I promise you, you won't be disappointed!!!!",
      date: 'Recent',
      verified: true,
    },
    {
      id: 2,
      name: 'Robert Gilley',
      rating: 5,
      text: "I've been reviewing a lot of different terminals to find the best ones and based off these strengths, I am excited to be able to use it when it comes out fully. EARLY BIRD. Key Strengths: Strong Technical Foundation with Modern Architecture, Cross-Platform support, Professional Development with comprehensive CI/CD pipeline, Innovative Features with AI-Powered Assistance, Advanced Terminal Features, Git Integration, and Commercial Viability with Production Ready status.",
      date: 'July 15, 2024',
      verified: true,
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'active' : ''}`}>
        ⭐
      </span>
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <h2>What Our Users Say</h2>
          <p>
            Real feedback from developers who are already using RinaWarp
            Terminal Pro
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                <div className="testimonial-meta">
                  <span className="testimonial-date">{testimonial.date}</span>
                  {testimonial.verified && (
                    <span className="verified-badge">✓ Verified</span>
                  )}
                </div>
              </div>

              <blockquote className="testimonial-text">
                "{testimonial.text}"
              </blockquote>

              <div className="testimonial-author">
                <div className="author-info">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="author-title">RinaWarp User</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonials-cta">
          <p>Join these satisfied users and experience RinaWarp yourself!</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              document
                .getElementById('pricing')
                .scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get RinaWarp Pro
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
