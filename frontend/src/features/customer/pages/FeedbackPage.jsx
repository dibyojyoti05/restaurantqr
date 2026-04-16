import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../../assets/styles/FeedbackPage.css';

const FeedbackPage = () => {
  const { tableId } = useParams();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('overall');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle feedback submission
    alert('Thank you for your feedback!');
    setRating(0);
    setFeedback('');
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${star <= rating ? 'active' : ''}`}
        onClick={() => setRating(star)}
      >
        ⭐
      </button>
    ));
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Share Your Experience</h1>
        <p>Your feedback helps us serve you better!</p>
      </div>

      <div className="feedback-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rate Your Experience</label>
            <div className="star-rating">
              {renderStars()}
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="form-group">
            <label>Feedback Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="overall">Overall Experience</option>
              <option value="food">Food Quality</option>
              <option value="service">Service</option>
              <option value="ambiance">Ambiance</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="value">Value for Money</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows="5"
              className="form-textarea"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={rating === 0}
          >
            Submit Feedback
          </button>
        </form>
      </div>

      <div className="quick-feedback">
        <h2>Quick Feedback</h2>
        <p>Tap on what describes your experience:</p>
        <div className="quick-options">
          <button className="quick-btn">😍 Amazing Food</button>
          <button className="quick-btn">⚡ Fast Service</button>
          <button className="quick-btn">💰 Great Value</button>
          <button className="quick-btn">🏠 Cozy Ambiance</button>
          <button className="quick-btn">👨‍🍳 Excellent Chef</button>
          <button className="quick-btn">🧹 Very Clean</button>
        </div>
      </div>

      <div className="feedback-incentive">
        <div className="incentive-card">
          <h3>🎁 Feedback Reward</h3>
          <p>Complete your feedback and get 10% off on your next visit!</p>
          <small>*Terms and conditions apply</small>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;