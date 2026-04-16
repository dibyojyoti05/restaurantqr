import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { menuAPI } from '../../../services/api';
import SessionManager from '../../../utils/sessionManager';
import '../../../assets/styles/MenuPage.css';

const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const { addItem, items, updateQuantity, getTotalItems } = useCart();

  useEffect(() => {
    // Check for new customer session first (silent reset, no alert on menu page)
    SessionManager.checkAndResetForNewCustomer(tableId, false);
    
    // Then fetch menu data
    fetchMenuData();
  }, [tableId]);

  const fetchMenuData = async () => {
    try {
      const response = await menuAPI.getAll();
      const items = response.data;
      
      // Group items by category
      const groupedData = items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image
        });
        return acc;
      }, {});
      
      setMenuData(groupedData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Fallback to static data if API fails
      setMenuData(staticMenuData);
    } finally {
      setLoading(false);
    }
  };

  // Static fallback menu data
  const staticMenuData = {
    starters: [
      {
        id: 'starter1',
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with aromatic spices',
        price: 280,
        image: '/images/paneertikka.png'
      },
      {
        id: 'starter2',
        name: 'French Fries',
        description: 'Crispy golden fries with herbs',
        price: 150,
        image: '/images/frenchfries.png'
      },
      {
        id: 'starter3',
        name: 'Caprese Salad',
        description: 'Fresh mozzarella with tomatoes and basil',
        price: 220,
        image: '/images/capresesalad.png'
      },
      {
        id: 'starter4',
        name: 'Garden Salad',
        description: 'Mixed greens with fresh vegetables',
        price: 180,
        image: '/images/salad.png'
      },
      {
        id: 'starter5',
        name: 'Garlic Naan',
        description: 'Soft bread topped with garlic and herbs',
        price: 90,
        image: '/images/garlicnan.png'
      },
      {
        id: 'starter6',
        name: 'Plain Naan',
        description: 'Traditional Indian flatbread',
        price: 70,
        image: '/images/nan.png'
      }
    ],
    'main-course': [
      {
        id: 'main1',
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh vegetables',
        price: 320,
        image: '/images/burger.png'
      },
      {
        id: 'main2',
        name: 'Butter Chicken',
        description: 'Tender chicken in rich creamy curry',
        price: 420,
        image: '/images/butterchicken.png'
      },
      {
        id: 'main3',
        name: 'Margherita Pizza',
        description: 'Classic pizza with mozzarella and basil',
        price: 380,
        image: '/images/pizza.png'
      },
      {
        id: 'main4',
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon and parmesan',
        price: 350,
        image: '/images/spaghetticarbonara.png'
      },
      {
        id: 'main5',
        name: 'Grilled Chicken',
        description: 'Perfectly seasoned grilled chicken breast',
        price: 390,
        image: '/images/Grilled Chicken.png'
      },
      {
        id: 'main6',
        name: 'Vegetable Biryani',
        description: 'Aromatic rice with mixed vegetables',
        price: 280,
        image: '/images/Vegetable Biryani.png'
      }
    ],
    desserts: [
      {
        id: 'dessert1',
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 220,
        image: '/images/tiramisu.png'
      },
      {
        id: 'dessert2',
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie with vanilla ice cream',
        price: 180,
        image: '/images/Chocolate Brownie.png'
      },
      {
        id: 'dessert3',
        name: 'Fresh Lemonade',
        description: 'Refreshing lemon drink with mint',
        price: 120,
        image: '/images/freshlemonade.png'
      },
      {
        id: 'dessert4',
        name: 'Cold Coffee',
        description: 'Chilled coffee with milk and ice cream',
        price: 140,
        image: '/images/coldcofee.png'
      },
      {
        id: 'dessert5',
        name: 'Virgin Mojito',
        description: 'Refreshing mint and lime drink',
        price: 130,
        image: '/images/mohito.png'
      },
      {
        id: 'dessert6',
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with chocolate sauce',
        price: 160,
        image: '/images/Ice Cream Sundae.png'
      }
    ]
  };

  const categories = [
    { key: 'appetizers', label: 'Appetizers' },
    { key: 'main-course', label: 'Main Course' },
    { key: 'sides', label: 'Sides' },
    { key: 'beverages', label: 'Beverages' },
    { key: 'desserts', label: 'Desserts' }
  ];

  const getItemQuantity = (itemId) => {
    const cartItem = items.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleViewCart = () => {
    const targetTableId = tableId || 'demo-table';
    navigate(`/cart/${targetTableId}`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Choose from our delicious categories</p>
        
        {/* New Customer Welcome */}
        {!SessionManager.hasGameProgress(tableId) && (
          <div className="new-customer-welcome" style={{
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
            border: '2px solid #4caf50',
            borderRadius: '12px',
            padding: '12px',
            margin: '15px 0',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0', color: '#2e7d32', fontSize: '0.9rem' }}>
              🎮 <strong>New Customer?</strong> Play games while waiting to earn rewards & discounts!
            </p>
          </div>
        )}
      </div>

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.key}
            className={`category-tab ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="menu-items">
        {(menuData[selectedCategory] || []).map(item => {
          const quantity = getItemQuantity(item.id);
          
          return (
            <div key={item.id} className="menu-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="item-footer">
                  <span className="price">₹{item.price}</span>
                  
                  {quantity === 0 ? (
                    <button
                      className="add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      ➕
                    </button>
                  ) : (
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, quantity - 1)}
                      >
                        ➖
                      </button>
                      <span className="quantity">{quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, quantity + 1)}
                      >
                        ➕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Cart Button - Fixed at bottom center */}
      {getTotalItems() > 0 && (
        <div className="view-cart-container">
          <button className="view-cart-btn" onClick={handleViewCart}>
            🛒 View Cart ({getTotalItems()})
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;