import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../../assets/styles/ContactUsPage.css';

const ContactUsPage = () => {
  const { tableId } = useParams();
  const [message, setMessage] = useState('');
  const [requestType, setRequestType] = useState('service');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    alert('Your message has been sent to our staff!');
    setMessage('');
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Need assistance? We're here to help!</p>
      </div>

      <div className="contact-options">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h3>Call Waiter</h3>
          <p>Get immediate assistance</p>
          <button className="btn btn-primary">Call Now</button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">🧾</div>
          <h3>Request Bill</h3>
          <p>Get your bill instantly</p>
          <button className="btn btn-primary">Request Bill</button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">🍽️</div>
          <h3>More Items</h3>
          <p>Order additional items</p>
          <button className="btn btn-primary">Add Items</button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">❓</div>
          <h3>Help & Support</h3>
          <p>General assistance</p>
          <button className="btn btn-primary">Get Help</button>
        </div>
      </div>

      <div className="message-form">
        <h2>Send a Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Request Type</label>
            <select 
              value={requestType} 
              onChange={(e) => setRequestType(e.target.value)}
              className="form-select"
            >
              <option value="service">Service Request</option>
              <option value="complaint">Complaint</option>
              <option value="compliment">Compliment</option>
              <option value="suggestion">Suggestion</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
              className="form-textarea"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Send Message
          </button>
        </form>
      </div>

      <div className="restaurant-info">
        <h2>Restaurant Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div>
              <h4>Address</h4>
              <p>123 Food Street, Delicious City, DC 12345</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📞</div>
            <div>
              <h4>Phone</h4>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">🕒</div>
            <div>
              <h4>Hours</h4>
              <p>Mon-Sun: 11:00 AM - 11:00 PM</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📧</div>
            <div>
              <h4>Email</h4>
              <p>info@deliciousbites.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;