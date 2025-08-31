import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Package, Settings, ArrowLeft, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { clearUserCache } from '../utils/cache';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'service';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'product' as 'product' | 'service',
    imageUrl: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadProducts = async () => {
    if (!currentUser) return;

    try {
      // Read from the products subcollection
      const productsRef = collection(db, 'users', currentUser.uid, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      const productsData: Product[] = [];
      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: data.id || doc.id, // Use the id field from data, or fallback to doc.id
          name: data.name,
          description: data.description,
          price: data.price,
          type: data.type,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      console.log('Loaded products:', productsData); // Debug log
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Kunde inte ladda produkter');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Bilden är för stor. Maximal storlek är 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('Image loaded, size:', result.length, 'characters');
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      setError('Alla fält är obligatoriska');
      return;
    }

    if (!currentUser) {
      setError('Du måste vara inloggad');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const newProduct: Product = {
        id: editingProduct?.id || Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.toString()),
        type: formData.type,
        imageUrl: formData.imageUrl || undefined,
        createdAt: editingProduct?.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Prepare product data for Firebase
      const productData = {
        id: editingProduct?.id || Date.now().toString(),
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        type: newProduct.type,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt
      };

      // Only add imageUrl if it exists and is not too large
      if (newProduct.imageUrl && newProduct.imageUrl.length < 1000000) { // Max 1MB for base64
        productData.imageUrl = newProduct.imageUrl;
      }

      if (editingProduct) {
        // Update existing product in subcollection
        await setDoc(doc(db, 'users', currentUser.uid, 'products', editingProduct.id), productData);
        
        // Update local state
        const updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
        setProducts(updatedProducts);
        
        // Clear cache to ensure website shows updated data
        if (currentUser) {
          clearUserCache(currentUser.uid);
        }
      } else {
        // Add new product to subcollection
        const newProductId = Date.now().toString();
        const newProductRef = doc(db, 'users', currentUser.uid, 'products', newProductId);
        await setDoc(newProductRef, {
          ...productData,
          id: newProductId
        });
        
        // Update local state with new product
        const productWithId = { ...newProduct, id: newProductId };
        setProducts([...products, productWithId]);
      }
      
      // Clear cache to ensure website shows updated data
      if (currentUser) {
        clearUserCache(currentUser.uid);
      }
      
      setSuccess(editingProduct ? 'Produkt uppdaterad!' : 'Produkt tillagd!');
      cancelForm();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        error: error,
        errorMessage: error.message,
        errorCode: error.code,
        currentUser: currentUser?.uid,
        formData: formData
      });
      setError(`Kunde inte spara produkt: ${error.message || 'Okänt fel'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type,
      imageUrl: product.imageUrl || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!currentUser) return;

    if (!window.confirm('Är du säker på att du vill ta bort denna produkt?')) {
      return;
    }

    try {
      // Delete from subcollection
      await deleteDoc(doc(db, 'users', currentUser.uid, 'products', productId));
      
      // Update local state
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      
      // Clear cache to ensure website shows updated data
      if (currentUser) {
        clearUserCache(currentUser.uid);
      }
      
      setSuccess('Produkt borttagen!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Kunde inte ta bort produkt. Försök igen.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'product',
      imageUrl: ''
    });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar produkter...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Du måste vara inloggad för att se denna sida</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Logga in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hantera produkter & tjänster
              </h1>
              <p className="text-gray-600">
                Lägg till, redigera och ta bort dina produkter och tjänster
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Lägg till produkt
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Redigera produkt' : 'Lägg till ny produkt'}
              </h3>
              <button
                onClick={cancelForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Namn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Produktnamn"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Typ *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'product' | 'service')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="product">Produkt</option>
                    <option value="service">Tjänst</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Beskriv din produkt eller tjänst..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Pris (SEK) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                    Bild (valfritt)
                  </label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förhandsvisning
                  </label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sparar...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Uppdatera' : 'Lägg till'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga produkter än</h3>
            <p className="text-gray-600 mb-6">
              Lägg till din första produkt eller tjänst för att komma igång
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Lägg till din första produkt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {product.type === 'product' ? (
                      <Package className="h-5 w-5 text-indigo-600 mr-2" />
                    ) : (
                      <Settings className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.type === 'product' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.type === 'product' ? 'Produkt' : 'Tjänst'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price} SEK
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.updatedAt.toLocaleDateString('sv-SE')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
