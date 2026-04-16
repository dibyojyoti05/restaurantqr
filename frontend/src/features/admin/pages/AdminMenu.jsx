import { useState, useEffect } from 'react';
import { menuAPI, adminAPI } from '../../../services/api';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizers',
    image: '',
    available: true,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: 'mild'
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Available preset images
  const presetImages = [
    '/images/burger.png',
    '/images/butterchicken.png',
    '/images/capresesalad.png',
    '/images/Chocolate Brownie.png',
    '/images/coldcofee.png',
    '/images/frenchfries.png',
    '/images/freshlemonade.png',
    '/images/garlicnan.png',
    '/images/Grilled Chicken.png',
    '/images/Ice Cream Sundae.png',
    '/images/mohito.png',
    '/images/nan.png',
    '/images/paneertikka.png',
    '/images/pasta.png',
    '/images/pizza.png',
    '/images/salad.png',
    '/images/spaghetticarbonara.png',
    '/images/tiramisu.png',
    '/images/Vegetable Biryani.png'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        await adminAPI.updateMenuItem(editingItem._id, itemData);
      } else {
        await adminAPI.addMenuItem(itemData);
      }

      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      spiceLevel: item.spiceLevel
    });
    setImagePreview(item.image);
    setImageFile(null);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminAPI.deleteMenuItem(itemId);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'appetizers',
      image: '',
      available: true,
      isVegetarian: false,
      isVegan: false,
      spiceLevel: 'mild'
    });
    setImagePreview('');
    setImageFile(null);
    setShowImageGallery(false);
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      image: url
    }));
    setImagePreview(url);
    setImageFile(null);
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const selectPresetImage = (imagePath) => {
    setImagePreview(imagePath);
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: imagePath
    }));
    setShowImageGallery(false);
  };

  return (
    <div className="admin-menu">
      <div className="page-header">
        <h1>Menu Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Item
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="appetizers">Appetizers</option>
                    <option value="main-course">Main Course</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                    <option value="sides">Sides</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Spice Level</label>
                  <select
                    name="spiceLevel"
                    value={formData.spiceLevel}
                    onChange={handleInputChange}
                  >
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                    <option value="extra-hot">Extra Hot</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Item Image</label>
                <div className="image-upload-section">
                  <div className="image-upload-options">
                    <div className="upload-option">
                      <label className="upload-btn">
                        📁 Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span className="upload-info">Max 5MB</span>
                    </div>
                    
                    <div className="upload-divider">OR</div>
                    
                    <div className="upload-option">
                      <button
                        type="button"
                        className="gallery-btn"
                        onClick={() => setShowImageGallery(!showImageGallery)}
                      >
                        🖼️ Choose from Gallery
                      </button>
                    </div>
                    
                    <div className="upload-divider">OR</div>
                    
                    <div className="upload-option">
                      <input
                        type="url"
                        placeholder="Enter image URL"
                        value={formData.image}
                        onChange={handleImageUrlChange}
                        className="image-url-input"
                      />
                    </div>
                  </div>

                  {showImageGallery && (
                    <div className="image-gallery">
                      <h4>Select an Image:</h4>
                      <div className="gallery-grid">
                        {presetImages.map((imagePath, index) => (
                          <div
                            key={index}
                            className="gallery-item"
                            onClick={() => selectPresetImage(imagePath)}
                          >
                            <img src={imagePath} alt={`Option ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={removeImage}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  Available
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleInputChange}
                  />
                  Vegetarian
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isVegan"
                    checked={formData.isVegan}
                    onChange={handleInputChange}
                  />
                  Vegan
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="menu-item-card">
            <div className="item-image">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="no-image-placeholder" style={{ display: item.image ? 'none' : 'flex' }}>
                <span>🍽️</span>
                <p>No Image</p>
              </div>
              {!item.available && (
                <div className="unavailable-overlay">Unavailable</div>
              )}
            </div>

            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <div className="item-meta">
                <span className="price">₹{item.price}</span>
                <span className="category">{item.category}</span>
              </div>

              <div className="item-badges">
                {item.isVegetarian && <span className="badge veg">VEG</span>}
                {item.isVegan && <span className="badge vegan">VEGAN</span>}
                {item.spiceLevel !== 'mild' && (
                  <span className={`badge spice ${item.spiceLevel}`}>
                    {item.spiceLevel.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="item-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .admin-menu {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .page-header h1 {
          margin: 0;
          color: #000;
        }

        .btn {
          padding: 10px 20px;
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

        .btn-secondary {
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
        }

        .btn-danger {
          background: #C1537A;
          color: white;
          border: 2px solid #A8456B;
        }

        .btn-danger:hover {
          background: #A8456B;
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
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
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
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-sizing: border-box;
        }

        .form-checkboxes {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          color: #000;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .menu-item-card {
          background: #F4EEED;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #EFD9D1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .item-image {
          position: relative;
          height: 140px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 15px;
          background: #F4EEED;
          box-sizing: border-box;
        }

        .item-image img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          display: block;
          margin: auto;
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          flex-shrink: 0;
        }

        .unavailable-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
        }

        .item-details {
          padding: 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .item-details h3 {
          margin: 0 0 6px 0;
          color: #000;
          font-size: 1rem;
        }

        .description {
          color: #666;
          font-size: 0.8rem;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .price {
          font-size: 1rem;
          font-weight: bold;
          color: #C1537A;
        }

        .category {
          background: #ecf0f1;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #000;
          text-transform: capitalize;
        }

        .item-badges {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .badge {
          padding: 1px 4px;
          border-radius: 6px;
          font-size: 0.6rem;
          font-weight: bold;
        }

        .badge.veg {
          background: #EFD9D1;
          color: #000;
          border: 1px solid #F4EEED;
        }

        .badge.vegan {
          background: #EFD9D1;
          color: #000;
          border: 1px solid #F4EEED;
        }

        .badge.spice {
          background: #f39c12;
          color: white;
        }

        .item-actions {
          display: flex;
          gap: 4px;
          margin-top: auto;
          padding-top: 8px;
        }

        .item-actions .btn {
          flex: 1;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          border-radius: 4px;
          min-height: 24px;
        }

        .image-upload-section {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .image-upload-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .upload-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .upload-btn {
          display: inline-block;
          padding: 10px 20px;
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          background: #F4EEED;
        }

        .upload-info {
          font-size: 0.8rem;
          color: #666;
        }

        .upload-divider {
          font-weight: bold;
          color: #999;
          margin: 10px 0;
        }

        .image-url-input {
          width: 100%;
          max-width: 300px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.9rem;
        }

        .image-preview {
          position: relative;
          margin-top: 15px;
          display: inline-block;
        }

        .image-preview img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #EFD9D1;
        }

        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #C1537A;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-image-btn:hover {
          background: #A8456B;
        }

        .no-image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: #999;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }

        .no-image-placeholder span {
          font-size: 2rem;
          margin-bottom: 5px;
        }

        .no-image-placeholder p {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .gallery-btn {
          padding: 10px 20px;
          background: #EFD9D1;
          color: #000;
          border: 2px solid #F4EEED;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .gallery-btn:hover {
          background: #F4EEED;
        }

        .image-gallery {
          margin-top: 15px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .image-gallery h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1rem;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 10px;
          max-height: 200px;
          overflow-y: auto;
        }

        .gallery-item {
          cursor: pointer;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .gallery-item:hover {
          border-color: #EFD9D1;
          transform: scale(1.05);
        }

        .gallery-item img {
          width: 100%;
          height: 60px;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default AdminMenu;