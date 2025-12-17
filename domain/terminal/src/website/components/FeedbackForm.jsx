import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    feedback: '',
    allowPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          rating: 5,
          feedback: '',
          allowPublic: false,
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Share Your Experience</h3>
      <p>Help others discover RinaWarp by sharing your feedback!</p>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating *</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= formData.rating ? 'active' : ''}`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, rating: star }))
                }
              >
                ⭐
              </button>
            ))}
            <span className="rating-text">
              {formData.rating === 1 && 'Poor'}
              {formData.rating === 2 && 'Fair'}
              {formData.rating === 3 && 'Good'}
              {formData.rating === 4 && 'Very Good'}
              {formData.rating === 5 && 'Excellent'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="feedback">Your Feedback *</label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Tell us about your experience with RinaWarp Terminal Pro..."
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="allowPublic"
              name="allowPublic"
              checked={formData.allowPublic}
              onChange={handleChange}
            />
            <span className="checkmark"></span>I allow RinaWarp to use this
            feedback publicly (with my name) for marketing purposes
          </label>
        </div>

        {submitStatus === 'success' && (
          <div className="success-message">
            ✅ Thank you for your feedback! We'll review it and may feature it
            on our website.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-message">
            ❌ There was an error submitting your feedback. Please try again.
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
