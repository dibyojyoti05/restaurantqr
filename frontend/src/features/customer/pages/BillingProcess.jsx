import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useParams } from 'react-router-dom';
import '../../../assets/styles/BillingProcess.css';

const BillingProcess = () => {
  const { tableId } = useParams();
  const { items, getTotalPrice } = useCart();
  const [step, setStep] = useState('customerInfo'); // 'customerInfo', 'bill', 'payment'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('');

  // Calculate order data from cart
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const orderData = {
    orderNumber: 'ORD-' + Math.floor(Math.random() * 10000),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    tableNumber: tableId?.slice(-2) || 'T01',
    items: items.length > 0 ? items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })) : [
      { name: 'Butter Chicken', quantity: 2, price: 399, total: 798 },
      { name: 'Garlic Naan', quantity: 3, price: 89, total: 267 },
      { name: 'Cold Coffee', quantity: 2, price: 129, total: 258 },
      { name: 'Tiramisu', quantity: 1, price: 199, total: 199 }
    ],
    subtotal: items.length > 0 ? subtotal : 1522,
    tax: items.length > 0 ? tax : 152.2,
    total: items.length > 0 ? total : 1674.2
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (customerInfo.name && customerInfo.phone) {
      setStep('bill');
    }
  };

  const handleDownloadBill = () => {
    // Simulate PDF download
    const billContent = generateBillText();
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${orderData.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCashPayment = () => {
    setPaymentStatus('cash');
    setStep('payment');
  };

  const handleUPIPayment = () => {
    setPaymentStatus('upi');
    setStep('payment');
    // Simulate UPI QR code display
    setTimeout(() => {
      alert('Please scan the UPI QR code or pay at the restaurant');
    }, 1000);
  };

  const generateBillText = () => {
    return `
WELCOME TO DELICIOUS BITES
================================
Order #: ${orderData.orderNumber}
Date: ${orderData.date}
Time: ${orderData.time}
Table: ${orderData.tableNumber}

Customer Details:
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}

================================
ITEMS ORDERED:
================================
${orderData.items.map(item => 
  `${item.name} x${item.quantity} - ₹${item.total}`
).join('\n')}

================================
Subtotal: ₹${orderData.subtotal}
Tax (10%): ₹${orderData.tax}
--------------------------------
TOTAL: ₹${orderData.total}
================================

Thank you for dining with us!
    `;
  };

  if (step === 'customerInfo') {
    return (
      <div className="billing-process">
        <div className="billing-container">
          <h1>Customer Information</h1>
          <p>Please provide your details to generate the bill</p>
          
          <form onSubmit={handleCustomerSubmit} className="customer-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Generate Bill
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'bill') {
    return (
      <div className="billing-process">
        <div className="billing-container">
          <div className="bill-header">
            <h1>Welcome to Delicious Bites</h1>
            <div className="bill-info">
              <p><strong>Order #:</strong> {orderData.orderNumber}</p>
              <p><strong>Date:</strong> {orderData.date}</p>
              <p><strong>Time:</strong> {orderData.time}</p>
              <p><strong>Table:</strong> {orderData.tableNumber}</p>
            </div>
          </div>

          <div className="customer-details">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {customerInfo.name}</p>
            <p><strong>Phone:</strong> {customerInfo.phone}</p>
          </div>

          <div className="bill-items">
            <h3>Items Ordered</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{orderData.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>₹{orderData.tax}</span>
            </div>
            <div className="summary-row total">
              <span><strong>Total Amount:</strong></span>
              <span><strong>₹{orderData.total}</strong></span>
            </div>
          </div>

          <div className="bill-actions">
            <button onClick={handleDownloadBill} className="btn btn-secondary">
              📄 Download Bill
            </button>
            <button onClick={handleCashPayment} className="btn btn-success">
              💵 Cash Payment
            </button>
            <button onClick={handleUPIPayment} className="btn btn-primary">
              📱 UPI Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="billing-process">
        <div className="billing-container">
          <div className="payment-status">
            {paymentStatus === 'cash' ? (
              <div className="status-card success">
                <div className="status-icon">✅</div>
                <h2>Payment Received</h2>
                <p>Payment received in cash</p>
                <p className="amount">Amount: ₹{orderData.total}</p>
                <button onClick={() => setStep('customerInfo')} className="btn btn-primary">
                  New Order
                </button>
              </div>
            ) : paymentStatus === 'upi' ? (
              <div className="status-card processing">
                <div className="status-icon">📱</div>
                <h2>UPI Payment</h2>
                <p>Scan QR code or pay at restaurant</p>
                <div className="upi-info">
                  <p>💡 You can complete UPI payment at the restaurant</p>
                </div>
                <button onClick={() => setStep('bill')} className="btn btn-secondary">
                  Go Back
                </button>
              </div>
            ) : (
              <div className="status-card processing">
                <div className="status-icon">🔄</div>
                <h2>Processing Payment</h2>
                <p>Please select a payment method</p>
                <button onClick={() => setStep('bill')} className="btn btn-secondary">
                  Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default BillingProcess;