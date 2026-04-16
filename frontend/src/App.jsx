import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import QRHomePage from './features/customer/pages/QRHomePage';
import MenuPage from './features/customer/pages/MenuPage';
import CartPage from './features/customer/pages/CartPage';
import CheckoutPage from './features/customer/pages/CheckoutPage';
import OrderStatusPage from './features/customer/pages/OrderStatusPage';
import BillPage from './features/customer/pages/BillPage';
import OrderListPage from './features/customer/pages/OrderListPage';
import WorkflowGuidePage from './features/customer/pages/WorkflowGuidePage';
import ContactUsPage from './features/customer/pages/ContactUsPage';
import FeedbackPage from './features/customer/pages/FeedbackPage';
import GamePage from './features/customer/pages/GamePage';
import BillingProcess from './features/customer/pages/BillingProcess';
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminOrders from './features/admin/pages/AdminOrders';
import AdminTables from './features/admin/pages/AdminTables';
import AdminMenu from './features/admin/pages/AdminMenu';
import ProtectedRoute from './components/ProtectedRoute';
import RouteHandler from './components/RouteHandler';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <div className="App">
              <RouteHandler />
              <Toaster position="top-right" />
              <Routes>
                {/* Customer Routes - Accessible via QR */}
                <Route path="/table/:tableId" element={
                  <CustomerLayout>
                    <QRHomePage />
                  </CustomerLayout>
                } />
                <Route path="/menu/:tableId" element={
                  <CustomerLayout>
                    <MenuPage />
                  </CustomerLayout>
                } />
                <Route path="/cart/:tableId" element={
                  <CustomerLayout>
                    <CartPage />
                  </CustomerLayout>
                } />
                <Route path="/checkout/:tableId" element={
                  <CustomerLayout>
                    <CheckoutPage />
                  </CustomerLayout>
                } />
                <Route path="/checkout/:tableId" element={
                  <CustomerLayout>
                    <CheckoutPage />
                  </CustomerLayout>
                } />
                <Route path="/order-status/:tableId" element={
                  <CustomerLayout>
                    <OrderStatusPage />
                  </CustomerLayout>
                } />
                <Route path="/bill/:tableId/:orderNumber" element={
                  <CustomerLayout>
                    <BillPage />
                  </CustomerLayout>
                } />
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/workflow" element={<WorkflowGuidePage />} />
                <Route path="/contact/:tableId" element={
                  <CustomerLayout>
                    <ContactUsPage />
                  </CustomerLayout>
                } />
                <Route path="/feedback/:tableId" element={
                  <CustomerLayout>
                    <FeedbackPage />
                  </CustomerLayout>
                } />
                <Route path="/game/:tableId" element={
                  <CustomerLayout>
                    <GamePage />
                  </CustomerLayout>
                } />
                <Route path="/games/:tableId" element={
                  <CustomerLayout>
                    <GamePage />
                  </CustomerLayout>
                } />
                <Route path="/billing/:tableId" element={
                  <CustomerLayout>
                    <BillingProcess />
                  </CustomerLayout>
                } />

                {/* Admin Routes - Not accessible via QR */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminOrders />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tables" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminTables />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/menu" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminMenu />
                    </AdminLayout>
                  </ProtectedRoute>
                } />

                {/* Test Routes for easier access */}
                <Route path="/qr" element={<QRHomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/billing" element={<BillingProcess />} />
                <Route path="/demo" element={
                  <CustomerLayout>
                    <QRHomePage />
                  </CustomerLayout>
                } />

                {/* QR Code Routes - Alternative patterns */}
                <Route path="/qr/:tableId" element={
                  <CustomerLayout>
                    <QRHomePage />
                  </CustomerLayout>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<AdminLogin />} />
                
                {/* Catch-all route for 404s */}
                <Route path="*" element={
                  <CustomerLayout>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <h2>Page Not Found</h2>
                      <p>The page you're looking for doesn't exist.</p>
                      <button 
                        onClick={() => window.location.href = '/table/demo-table'}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#EFD9D1', 
                          border: 'none', 
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Go to Demo Table
                      </button>
                    </div>
                  </CustomerLayout>
                } />
              </Routes>
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;