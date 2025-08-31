import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Settings, MapPin, Users, Building2, Instagram, Facebook, Music, Share2, Heart } from 'lucide-react';
import { DataService } from '../services/dataService';
import { UserData } from '../utils/cache';

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

const ProductDetail: React.FC = () => {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    loadProductData();
  }, [slug, productId]);

  const loadProductData = async () => {
    if (!slug || !productId) {
      setError('Produkt hittades inte');
      setLoading(false);
      return;
    }

    // Check if we came from the website page (which should have the data)
    const state = location.state as { websiteData?: UserData } | null;
    if (state?.websiteData) {
      const foundProduct = state.websiteData.products.find((p: Product) => p.id === productId);
      if (foundProduct) {
        setUserData(state.websiteData);
        setProduct(foundProduct);
        setSelectedImage(foundProduct.imageUrl || '');
        setLoading(false);
        return;
      }
    }

    // Fetch data using the data service
    try {
      const data = await DataService.getWebsiteDataBySlug(slug);
      
      if (data) {
        const foundProduct = data.products.find((p: Product) => p.id === productId);
        if (foundProduct) {
          setUserData(data);
          setProduct(foundProduct);
          setSelectedImage(foundProduct.imageUrl || '');
        } else {
          setError('Produkt hittades inte');
        }
      } else {
        setError('Webbplats hittades inte');
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      setError('Kunde inte ladda produkt');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    // In the future, this could open a contact form or redirect to contact page
    alert('Kontakta oss för att beställa denna produkt/tjänst!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar produkt...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produkt inte tillgänglig</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/website/${userId}`)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Tillbaka till webbplats
          </button>
        </div>
      </div>
    );
  }

  const { companyData } = userData;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/website/${slug}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka till {companyData.name}
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    {product.type === 'product' ? (
                      <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    ) : (
                      <Settings className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-500">Ingen bild tillgänglig</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Gallery (for future multiple images) */}
            {product.imageUrl && (
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedImage(product.imageUrl!)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === product.imageUrl ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                {/* Future: Add more image thumbnails here */}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Type Badge */}
            <div className="flex items-center">
              {product.type === 'product' ? (
                <Package className="h-5 w-5 text-indigo-600 mr-2" />
              ) : (
                <Settings className="h-5 w-5 text-green-600 mr-2" />
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.type === 'product' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.type === 'product' ? 'Produkt' : 'Tjänst'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Price */}
            <div className="text-3xl font-bold text-indigo-600">
              {product.price} SEK
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beskrivning</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Future: Size Selection */}
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Välj storlek</h3>
              <div className="flex space-x-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Future: Color Selection */}
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Välj färg</h3>
              <div className="flex space-x-2">
                {['Svart', 'Vit', 'Blå', 'Röd'].map((color) => (
                  <button
                    key={color}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleContact}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
              >
                Kontakta oss för beställning
              </button>
              
              <button
                onClick={() => navigate(`/website/${userId}`)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Se fler produkter
              </button>
            </div>

            {/* Company Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Om företaget</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">{companyData.name}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">{companyData.town}</span>
                </div>
                {companyData.owners.length > 0 && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{companyData.owners.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(companyData.instagram || companyData.facebook || companyData.tiktok) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Följ oss</h4>
                  <div className="flex space-x-4">
                    {companyData.instagram && (
                      <a
                        href={`https://instagram.com/${companyData.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {companyData.facebook && (
                      <a
                        href={`https://facebook.com/${companyData.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {companyData.tiktok && (
                      <a
                        href={`https://tiktok.com/@${companyData.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <Music className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 {companyData.name}. Alla rättigheter förbehållna.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Skapad med WebBuilder
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
