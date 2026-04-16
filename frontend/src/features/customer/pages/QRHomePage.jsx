import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tablesAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import '../../../assets/styles/QRHomePage.css';

const QRHomePage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { setTable } = useCart();
  const [table, setTableData] = useState(null);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const offers = [
    {
      id: 1,
      title: "20% OFF on Orders Above ₹500",
      description: "Valid till today midnight • Use code: SAVE20",
      image: "/images/burger.png",
      type: "ongoing",
      discount: "20% OFF"
    },
    {
      id: 2,
      title: "Buy 1 Get 1 Free Pizza",
      description: "Available on weekends • Dine-in only",
      image: "/images/pizza.png",
      type: "ongoing",
      discount: "BOGO"
    },
    {
      id: 3,
      title: "Free Dessert with Main Course",
      description: "Choose from Tiramisu, Brownie or Ice Cream",
      image: "/images/tiramisu.png",
      type: "ongoing",
      discount: "FREE"
    },
    {
      id: 4,
      title: "Fresh Lemonade + Mojito Combo",
      description: "Refreshing drinks combo at special price",
      image: "/images/freshlemonade.png",
      type: "ongoing",
      discount: "₹50 OFF"
    },
    {
      id: 5,
      title: "Butter Chicken + Naan Special",
      description: "Our signature dish with garlic naan",
      image: "/images/butterchicken.png",
      type: "ongoing",
      discount: "₹100 OFF"
    }
  ];

  useEffect(() => {
    if (tableId) {
      fetchTable();
    } else {
      // Demo mode - set a default table
      setTableData({
        _id: 'demo-table',
        tableNumber: 'DEMO',
        location: 'Demo Location'
      });
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [offers.length]);

  const fetchTable = async () => {
    try {
      // First try to get table by QR code (which is what we get from URL)
      const response = await tablesAPI.getByQR(tableId);
      setTableData(response.data);
      setTable(response.data._id);
    } catch (error) {
      console.error('Error fetching table by QR code:', error);
      
      // If QR lookup fails, try by ID as fallback
      try {
        const response = await tablesAPI.getById(tableId);
        setTableData(response.data);
        setTable(response.data._id);
      } catch (idError) {
        console.error('Error fetching table by ID:', error);
        // Fallback to demo mode if both fail
        setTableData({
          _id: 'demo-table',
          tableNumber: 'DEMO',
          location: 'Demo Location'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (route) => {
    const targetTableId = tableId || 'demo-table';
    navigate(`/${route}/${targetTableId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!table) {
    return <div className="error">Table not found</div>;
  }

  return (
    <div className="qr-home-page">
      {/* Header */}
      <div className="header">
        <h1>Welcome to Delicious Bites</h1>
        <p>Table {table?.tableNumber || 'DEMO'} • {table?.location || 'Demo Location'}</p>
        <div className="table-info">
          <span className="table-badge">{table?.tableNumber || 'DEMO'}</span>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="action-cards">
        <div className="card" onClick={() => handleCardClick('menu')}>
          <div className="card-icon">🍽️</div>
          <h3>View Menu</h3>
          <p>Browse our delicious offerings</p>
        </div>

        <div className="card" onClick={() => handleCardClick('order-status')}>
          <div className="card-icon">📋</div>
          <h3>Order Status</h3>
          <p>Track your current order</p>
        </div>

        <div className="card" onClick={() => handleCardClick('contact')}>
          <div className="card-icon">📞</div>
          <h3>Contact Us</h3>
          <p>Need help? Reach out to us</p>
        </div>

        <div className="card" onClick={() => handleCardClick('feedback')}>
          <div className="card-icon">⭐</div>
          <h3>Feedback</h3>
          <p>Share your experience</p>
        </div>
      </div>

      {/* Offers Slider */}
      <div className="offers-section">
        <h2>Offers & Promotions</h2>
        <div className="offers-slider">
          <div 
            className="offers-container"
            style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}
          >
            {offers.map((offer, index) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-image">
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-fallback" style={{ display: 'none' }}>
                    <span>🍽️</span>
                  </div>
                  <div className="discount-badge">
                    {offer.discount}
                  </div>
                  <div className={`offer-badge ${offer.type}`}>
                    {offer.type === 'ongoing' ? 'Available Now' : 'Coming Soon'}
                  </div>
                </div>
                <div className="offer-content">
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <button className="claim-offer-btn">
                    🎯 Claim Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Slider Dots */}
        <div className="slider-dots">
          {offers.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentOfferIndex ? 'active' : ''}`}
              onClick={() => setCurrentOfferIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="btn btn-primary"
          onClick={() => handleCardClick('menu')}
        >
          Start Ordering
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/workflow')}
        >
          📋 How It Works
        </button>
      </div>
    </div>
  );
};

export default QRHomePage;