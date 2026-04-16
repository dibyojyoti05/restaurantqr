import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', icon: '📋' },
    { path: '/admin/tables', label: 'Tables', icon: '🪑' },
    { path: '/admin/menu', label: 'Menu', icon: '🍽️' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <p>Welcome, {admin?.username}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Restaurant Management</h1>
          <div className="header-actions">
            <span>Admin: {admin?.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;