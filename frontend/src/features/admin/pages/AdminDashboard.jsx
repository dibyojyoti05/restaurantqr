import { useState, useEffect } from 'react';
import { adminAPI, ordersAPI } from '../../../services/api';
import { FiDollarSign, FiShoppingBag, FiUsers, FiClock, FiRefreshCw } from 'react-icons/fi';
import SessionManager from '../../../utils/sessionManager';
import QRTester from '../../../components/QRTester';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOrders({ limit: 10 })
      ]);
      
      setStats(statsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 style={{ color: '#000' }}>Restaurant Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon" />
          <div className="stat-info">
            <h3 style={{ color: '#000' }}>Today's Orders</h3>
            <p className="stat-number" style={{ color: '#000' }}>{stats.todayOrders || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FiClock className="stat-icon" />
          <div className="stat-info">
            <h3 style={{ color: '#000' }}>Pending Orders</h3>
            <p className="stat-number" style={{ color: '#000' }}>{stats.pendingOrders || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FiDollarSign className="stat-icon" />
          <div className="stat-info">
            <h3 style={{ color: '#000' }}>Today's Revenue</h3>
            <p className="stat-number" style={{ color: '#000' }}>₹{stats.totalRevenue || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <div className="stat-info">
            <h3 style={{ color: '#000' }}>Occupied Tables</h3>
            <p className="stat-number" style={{ color: '#000' }}>{stats.occupiedTables || 0}</p>
          </div>
        </div>
      </div>

      {/* New Customer Reset Section */}
      <div className="customer-reset-section" style={{
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}>
        <h2 style={{ color: '#000', marginBottom: '15px' }}>
          <FiRefreshCw style={{ marginRight: '8px' }} />
          New Customer Management
        </h2>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Reset game data when new customers arrive at tables to ensure fair gameplay and rewards.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['table-1', 'table-2', 'table-3', 'table-4', 'table-5', 'table-6'].map(tableId => (
            <div key={tableId} style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '10px',
              background: 'white',
              minWidth: '200px'
            }}>
              <h4 style={{ color: '#000', margin: '0 0 8px 0' }}>{tableId.toUpperCase()}</h4>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                Progress: {SessionManager.hasGameProgress(tableId) ? '✅ Has Data' : '❌ No Data'}
              </p>
              <button
                onClick={() => {
                  if (confirm(`Reset game data for ${tableId.toUpperCase()}? This will clear all scores and rewards.`)) {
                    SessionManager.manualResetForNewCustomer(tableId);
                    alert(`✅ Game data reset for ${tableId.toUpperCase()}`);
                    // Force re-render by updating a state
                    setStats({...stats});
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔄 Reset for New Customer
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
          <p style={{ color: '#1976d2', margin: '0', fontSize: '0.9rem' }}>
            💡 <strong>Tip:</strong> Use this when you see new customers sitting at a table to ensure they start with fresh game data and can earn their own rewards.
          </p>
        </div>
      </div>

      {/* QR Code Tester for Development */}
      <QRTester />

      <div className="recent-orders">
        <h2 style={{ color: '#000' }}>Recent Orders</h2>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3 style={{ color: '#000' }}>#{order.orderNumber}</h3>
                <span className={`status-badge ${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              
              <div className="order-details">
                <p style={{ color: '#000' }}><strong>Customer:</strong> {order.customerName}</p>
                <p style={{ color: '#000' }}><strong>Table:</strong> {order.tableId?.tableNumber}</p>
                <p style={{ color: '#000' }}><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p style={{ color: '#000' }}><strong>Items:</strong> {order.items.length}</p>
              </div>
              
              <div className="order-actions">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    className="btn btn-success"
                  >
                    Confirm
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                    className="btn btn-warning"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                    className="btn btn-info"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'served')}
                    className="btn btn-primary"
                  >
                    Mark Served
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;