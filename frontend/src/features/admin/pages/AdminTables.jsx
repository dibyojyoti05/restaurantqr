import { useState, useEffect } from 'react';
import { tablesAPI, adminAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 2,
    location: ''
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tables from API...');
      const response = await adminAPI.getTables();
      console.log('Tables response:', response.data);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables. Please try again.');
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const tableData = {
        tableNumber: newTable.tableNumber,
        capacity: newTable.capacity,
        location: newTable.location
      };

      console.log('Adding table:', tableData);
      const response = await adminAPI.addTable(tableData);
      console.log('Table added:', response.data);
      
      toast.success(`Table ${newTable.tableNumber} added successfully!`);
      
      setNewTable({ tableNumber: '', capacity: 2, location: '' });
      setShowAddForm(false);
      
      // Refresh the tables list
      await fetchTables();
    } catch (error) {
      console.error('Error adding table:', error);
      const message = error.response?.data?.message || 'Failed to add table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeURL = (table) => {
    // Always use the working redirect method for QR codes
    const isProduction = window.location.hostname !== 'localhost';
    
    if (isProduction) {
      // Production: Use Vercel with redirect page
      return `https://restaurantqr-seven.vercel.app/table.html?id=${table.qrCode}`;
    } else {
      // Local: Use local redirect page for consistent behavior
      return `http://localhost:3001/table.html?id=${table.qrCode}`;
    }
  };

  const showQRCode = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleEditTable = (table) => {
    setEditingTable({
      ...table,
      capacity: table.capacity || 2
    });
    setShowEditForm(true);
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const updateData = {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location,
        status: editingTable.status
      };

      console.log('Updating table:', updateData);
      const response = await adminAPI.updateTable(editingTable._id, updateData);
      console.log('Table updated:', response.data);
      
      toast.success(`Table ${editingTable.tableNumber} updated successfully!`);
      
      setEditingTable(null);
      setShowEditForm(false);
      
      // Refresh the tables list
      await fetchTables();
    } catch (error) {
      console.error('Error updating table:', error);
      const message = error.response?.data?.message || 'Failed to update table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Are you sure you want to delete table ${table.tableNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      console.log('Deleting table:', table._id);
      await adminAPI.deleteTable(table._id);
      
      toast.success(`Table ${table.tableNumber} deleted successfully!`);
      
      // Refresh the tables list
      await fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      const message = error.response?.data?.message || 'Failed to delete table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeSVG = (text, size = 200) => {
    // Simple QR code generation using a public API
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=FFFFFF&color=000000&format=png&margin=10`;
  };

  return (
    <div className="admin-tables">
      <div className="page-header">
        <h1>Table Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary btn-small"
            onClick={fetchTables}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button 
            className="btn btn-primary btn-small"
            onClick={() => setShowAddForm(true)}
          >
            + Add
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Table</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Table Number</label>
                <input
                  type="text"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                  placeholder="e.g., T01, T02"
                  required
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <select
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                >
                  <option value={2}>2 People</option>
                  <option value={4}>4 People</option>
                  <option value={6}>6 People</option>
                  <option value={8}>8 People</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newTable.location}
                  onChange={(e) => setNewTable({...newTable, location: e.target.value})}
                  placeholder="e.g., Window Side, Center, Corner"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editingTable && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Table - {editingTable.tableNumber}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTable(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateTable}>
              <div className="form-group">
                <label>Table Number</label>
                <input
                  type="text"
                  value={editingTable.tableNumber}
                  onChange={(e) => setEditingTable({...editingTable, tableNumber: e.target.value})}
                  placeholder="e.g., T01, T02"
                  required
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <select
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
                >
                  <option value={2}>2 People</option>
                  <option value={4}>4 People</option>
                  <option value={6}>6 People</option>
                  <option value={8}>8 People</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editingTable.location}
                  onChange={(e) => setEditingTable({...editingTable, location: e.target.value})}
                  placeholder="e.g., Window Side, Center, Corner"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingTable.status}
                  onChange={(e) => setEditingTable({...editingTable, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowEditForm(false);
                  setEditingTable(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && selectedTable && (
        <div className="modal-overlay">
          <div className="qr-modal">
            <div className="modal-header">
              <h2>📱 Scan QR Code - {selectedTable.tableNumber}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="qr-content">
              <div className="qr-code-container">
                <img 
                  src={generateQRCodeSVG(generateQRCodeURL(selectedTable), 250)}
                  alt={`QR Code for ${selectedTable.tableNumber}`}
                  className="qr-code-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="qr-fallback" style={{ display: 'none' }}>
                  <div className="qr-placeholder">
                    <h3>📱 QR Code</h3>
                    <p>QR Code for {selectedTable.tableNumber}</p>
                    <p>Use the URL below to access this table</p>
                  </div>
                </div>
              </div>
              
              <div className="qr-info">
                <h3>{selectedTable.tableNumber}</h3>
                <p><strong>Capacity:</strong> {selectedTable.capacity} people</p>
                <p><strong>Location:</strong> {selectedTable.location}</p>
                <p><strong>QR Code:</strong> {selectedTable.qrCode}</p>
              </div>
              
              <div className="qr-url">
                <p><strong>URL:</strong></p>
                <div className="url-display">
                  {generateQRCodeURL(selectedTable)}
                </div>
              </div>
              
              <div className="qr-instructions">
                <h4>📋 Instructions:</h4>
                <ul>
                  <li>🔍 Use your phone camera to scan the QR code</li>
                  <li>📱 Or share the URL with customers</li>
                  <li>🍽️ Customers can access the menu directly</li>
                  <li>📋 Orders will be linked to this table</li>
                </ul>
              </div>
              
              <div className="qr-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    const url = generateQRCodeURL(selectedTable);
                    navigator.clipboard.writeText(url);
                    alert('QR URL copied to clipboard!');
                  }}
                >
                  📋 Copy URL
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const url = generateQRCodeURL(selectedTable);
                    window.open(url, '_blank');
                  }}
                >
                  🔗 Open Link
                </button>
                
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    // Download QR code
                    const link = document.createElement('a');
                    link.href = generateQRCodeSVG(generateQRCodeURL(selectedTable), 400);
                    link.download = `QR_${selectedTable.tableNumber}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  💾 Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <p>Loading tables...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchTables}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && tables.length === 0 && (
        <div className="empty-state">
          <p>No tables found. Add your first table!</p>
        </div>
      )}

      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table._id} className="table-card">
            <div className="table-header">
              <h3>{table.tableNumber}</h3>
              <span className={`status ${table.status}`}>
                {table.status}
              </span>
            </div>
            
            <div className="table-details">
              <p><strong>Capacity:</strong> {table.capacity} people</p>
              <p><strong>Location:</strong> {table.location}</p>
              <p><strong>QR Code:</strong> {table.qrCode}</p>
            </div>

            <div className="table-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => showQRCode(table)}
                title="View QR Code"
              >
                📱 QR
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => handleEditTable(table)}
                title="Edit Table"
              >
                ✏️ Edit
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteTable(table)}
                title="Delete Table"
                disabled={table.currentOrder}
              >
                🗑️ Delete
              </button>
            </div>

            {table.currentOrder && (
              <div className="current-order">
                <p><strong>Current Order:</strong> #{table.currentOrder.orderNumber}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .admin-tables {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .page-header h1 {
          margin: 0;
          color: #000;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-small {
          padding: 8px 1px;
          font-size: 0.75rem;
          width: 35px;
          height: 32px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
        }

        .btn-primary:hover {
          background: #F4EEED;
        }

        .btn-secondary {
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
        }

        .btn-secondary:hover {
          background: #F4EEED;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #F4EEED;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          border: 2px solid #EFD9D1;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #000;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-sizing: border-box;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .table-card {
          background: #F4EEED;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #EFD9D1;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .table-header h3 {
          margin: 0;
          color: #000;
        }

        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status.available {
          background: #d4edda;
          color: #155724;
        }

        .status.occupied {
          background: #f8d7da;
          color: #721c24;
        }

        .table-details {
          margin-bottom: 15px;
        }

        .table-details p {
          margin: 5px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .table-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .table-actions .btn {
          flex: 1;
          font-size: 0.7rem;
          padding: 6px 4px;
          min-width: 60px;
        }

        .current-order {
          padding: 10px;
          background: #fff3cd;
          border-radius: 5px;
          border-left: 4px solid #ffc107;
        }

        .current-order p {
          margin: 0;
          font-size: 0.9rem;
          color: #856404;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 40px;
          background: #F4EEED;
          border-radius: 10px;
          border: 2px solid #EFD9D1;
          margin-bottom: 20px;
        }

        .loading-state p,
        .error-state p,
        .empty-state p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 1.1rem;
        }

        .error-state {
          background: #f8d7da;
          border-color: #f5c6cb;
        }

        .error-state p {
          color: #721c24;
        }

        .qr-modal {
          background: #F4EEED;
          padding: 30px;
          border-radius: 15px;
          width: 90%;
          max-width: 600px;
          border: 2px solid #EFD9D1;
          max-height: 90vh;
          overflow-y: auto;
        }

        .qr-content {
          text-align: center;
        }

        .qr-code-container {
          margin: 20px 0;
          padding: 20px;
          background: white;
          border-radius: 10px;
          border: 2px solid #EFD9D1;
          display: inline-block;
        }

        .qr-code-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .qr-fallback {
          padding: 40px 20px;
        }

        .qr-placeholder {
          border: 2px dashed #ccc;
          padding: 30px;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .qr-placeholder h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 1.5rem;
        }

        .qr-placeholder p {
          margin: 5px 0;
          color: #888;
        }

        .qr-info {
          margin: 20px 0;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #EFD9D1;
        }

        .qr-info h3 {
          margin: 0 0 10px 0;
          color: #000;
          font-size: 1.3rem;
        }

        .qr-info p {
          margin: 5px 0;
          color: #666;
        }

        .qr-url {
          margin: 20px 0;
          text-align: left;
        }

        .qr-url p {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #000;
        }

        .url-display {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ddd;
          font-family: monospace;
          font-size: 0.9rem;
          word-break: break-all;
          color: #333;
        }

        .qr-instructions {
          margin: 20px 0;
          text-align: left;
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }

        .qr-instructions h4 {
          margin: 0 0 10px 0;
          color: #1976d2;
          font-size: 1rem;
        }

        .qr-instructions ul {
          margin: 0;
          padding-left: 20px;
        }

        .qr-instructions li {
          margin: 5px 0;
          color: #1565c0;
          font-size: 0.9rem;
        }

        .qr-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .qr-actions .btn {
          flex: 1;
          min-width: 120px;
          font-size: 0.8rem;
          padding: 8px 12px;
        }

        .btn-success {
          background: #28a745;
          color: white;
          border: 2px solid transparent;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          border: 2px solid transparent;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn-danger:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .qr-modal {
            padding: 20px;
            margin: 10px;
          }
          
          .qr-actions {
            flex-direction: column;
          }
          
          .qr-actions .btn {
            width: 100%;
            margin: 5px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminTables;