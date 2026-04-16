import { useParams, useNavigate } from 'react-router-dom';
import '../../assets/styles/CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate(`/table/${tableId}`);
  };

  return (
    <div className="customer-layout">
      <header className="customer-header">
        <button className="back-btn" onClick={handleBackHome}>
          ← Home
        </button>
        <div className="restaurant-logo">
          <h2>Welcome to Delicious Bites</h2>
        </div>
        <div className="table-info">
          {tableId?.slice(-3) || 'DEMO'}
        </div>
      </header>
      
      <main className="customer-main">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;