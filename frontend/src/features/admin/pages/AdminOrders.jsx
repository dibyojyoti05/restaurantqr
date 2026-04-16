import { useState, useEffect } from 'react';
import { adminAPI, ordersAPI } from '../../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminAPI.getOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'preparing': return '#fd7e14';
      case 'ready': return '#28a745';
      case 'served': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'served'
    };
    return statusFlow[currentStatus];
  };

  const getStatusAction = (status) => {
    switch (status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Served';
      default: return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="page-header">
        <h1>Order Management</h1>
        <div className="order-filters">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'served'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for the selected filter.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>#{order.orderNumber}</h3>
                  <p>Table: {order.tableId?.tableNumber}</p>
                  <p>Customer: {order.customerName}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                  <p className="order-time">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.menuItem?.name || 'Unknown Item'}</span>
                    <span>x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ₹{order.totalAmount}</strong>
                  {order.estimatedTime && (
                    <p>Est. Time: {order.estimatedTime} min</p>
                  )}
                </div>

                <div className="order-actions">
                  {getNextStatus(order.status) && (
                    <button
                      className="btn btn-primary"
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                    >
                      {getStatusAction(order.status)}
                    </button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'served' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {order.specialRequests && (
                <div className="special-requests">
                  <strong>Special Requests:</strong> {order.specialRequests}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .admin-orders {
          padding: 20px;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          margin-bottom: 20px;
          color: #000;
        }

        .order-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #EFD9D1;
          background: #F4EEED;
          color: #000;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: #EFD9D1;
          color: #000;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .no-orders {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .order-card {
          background: #F4EEED;
          border-radius: 10px;
          padding: 20px;
          border: 2px solid #EFD9D1;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .order-info h3 {
          margin: 0 0 5px 0;
          color: #000;
        }

        .order-info p {
          margin: 2px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .order-status {
          text-align: right;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .order-time {
          margin: 5px 0 0 0;
          font-size: 0.8rem;
          color: #999;
        }

        .order-items {
          margin-bottom: 15px;
        }

        .order-items h4 {
          margin-bottom: 10px;
          color: #000;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .order-total strong {
          color: #000;
          font-size: 1.1rem;
        }

        .order-total p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
        }

        .btn-primary:hover {
          background: #F4EEED;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .special-requests {
          background: #fff3cd;
          padding: 10px;
          border-radius: 5px;
          border-left: 4px solid #ffc107;
          font-size: 0.9rem;
          color: #856404;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 1.2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            gap: 10px;
          }

          .order-footer {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .order-actions {
            justify-content: stretch;
          }

          .order-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;