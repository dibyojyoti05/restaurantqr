import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import '../../../assets/styles/CartPage.css';

const CartPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <FiShoppingBag size={64} />
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our menu</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/menu/${tableId}`)}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Order</h1>
      
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="price">₹{item.price}</p>
            </div>
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                <FiMinus />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                <FiPlus />
              </button>
            </div>
            <button className="remove-btn" onClick={() => removeItem(item.id)}>
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="total">
          <span>Total ({getTotalItems()} items): ₹{getTotalPrice()}</span>
        </div>
        <button 
          className="btn btn-primary btn-large"
          onClick={() => navigate(`/checkout/${tableId}`)}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;