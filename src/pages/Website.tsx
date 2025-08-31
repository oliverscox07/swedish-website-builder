import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Instagram, Facebook, Music, Users, Package, Settings, Phone, Mail, RefreshCw } from 'lucide-react';
import { DataService } from '../services/dataService';
import { UserData } from '../utils/cache';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, onSnapshot as onDocSnapshot, getDocs } from 'firebase/firestore';

interface CompanyData {
  name: string;
  town: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  owners: string[];
}

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

interface UserData {
  companyData: CompanyData;
  products: Product[];
}

// Extend Window interface for real-time listeners
declare global {
  interface Window {
    realtimeUnsubscribers?: (() => void)[];
  }
}

const Website: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWebsiteData();
    
    // Set up real-time listener for instant updates
    if (slug) {
      setupRealtimeListener();
    }
    
    return () => {
      // Cleanup listeners when component unmounts
      if (window.realtimeUnsubscribers) {
        window.realtimeUnsubscribers.forEach(unsub => unsub());
        window.realtimeUnsubscribers = [];
      }
    };
  }, [slug]);

  const loadWebsiteData = async (forceRefresh = false) => {
    if (!slug) {
      setError('Inget företagsnamn angivet');
      setLoading(false);
      return;
    }

    try {
      // Clear cache if forcing refresh
      if (forceRefresh) {
        DataService.clearCache();
      }
      
      const data = await DataService.getWebsiteDataBySlug(slug);
      
      if (data) {
        setUserData(data);
        
        // Check if this is an old slug and redirect to the new one
        if (data.companyData.slug && data.companyData.slug !== slug) {
          // Redirect to the new URL
          window.location.href = `/website/${data.companyData.slug}`;
          return;
        }
      } else {
        setError('Webbplats hittades inte');
      }
    } catch (error) {
      console.error('Error loading website data:', error);
      setError('Kunde inte ladda webbplats');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = async () => {
    if (!slug) return;

    try {
      // Initialize unsubscribers array if it doesn't exist
      if (!window.realtimeUnsubscribers) {
        window.realtimeUnsubscribers = [];
      }

      // Find the user with this slug
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyData.slug', '==', slug));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const userId = doc.id;
          const data = doc.data();
          
          if (data.companyData) {
            // Fetch products from subcollection
            const productsRef = collection(db, 'users', userId, 'products');
            const productsSnapshot = await getDocs(productsRef);
            
            const products = [];
            productsSnapshot.forEach((productDoc) => {
              const productData = productDoc.data();
              products.push({
                id: productData.id || productDoc.id,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                type: productData.type,
                imageUrl: productData.imageUrl,
                createdAt: productData.createdAt?.toDate() || new Date(),
                updatedAt: productData.updatedAt?.toDate() || new Date()
              });
            });
            
            const updatedData = {
              companyData: data.companyData,
              products: products
            };
            
            setUserData(updatedData);
          }
        }
      });
      
      window.realtimeUnsubscribers.push(unsubscribe);
      
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar webbplats...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Webbplats inte tillgänglig</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const { companyData, products } = userData;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center relative">
            <button
              onClick={() => loadWebsiteData(true)}
              className="absolute top-0 right-0 p-2 text-white hover:text-gray-200 transition-colors"
              title="Uppdatera sida"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {companyData.name}
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Välkommen till {companyData.town}
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {companyData.town}
              </div>
              {companyData.owners.length > 0 && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {companyData.owners.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Om oss</h2>
            {companyData.description ? (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {companyData.description}
              </p>
            ) : (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Vi är ett UF-företag baserat i {companyData.town} som erbjuder kvalitativa produkter och tjänster.
                Vårt mål är att leverera det bästa för våra kunder.
              </p>
            )}
          </div>

          {/* Company Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Building2 className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Företag</h3>
              <p className="text-gray-600">{companyData.name}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Plats</h3>
              <p className="text-gray-600">{companyData.town}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Ägare</h3>
              <p className="text-gray-600">{companyData.owners.join(', ')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Package className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Produkter</h3>
              <p className="text-gray-600">{products.length} st</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products/Services Section */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Våra produkter & tjänster</h2>
              <p className="text-lg text-gray-600">
                Upptäck vårt utbud av kvalitativa produkter och tjänster
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/website/${slug}/product/${product.id}`, { 
                state: { websiteData: userData } 
              })}
                >
                  {product.imageUrl && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
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
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {product.price} SEK
                      </span>
                      <span className="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
                        Klicka för mer info →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kontakta oss</h2>
            <p className="text-lg text-gray-600">
              Hör av dig till oss för mer information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Building2 className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Företag</h3>
              <p className="text-gray-600">{companyData.name}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Adress</h3>
              <p className="text-gray-600">{companyData.town}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Ägare</h3>
              <p className="text-gray-600">{companyData.owners.join(', ')}</p>
            </div>
          </div>

          {/* Social Media */}
          {(companyData.instagram || companyData.facebook || companyData.tiktok) && (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Följ oss</h3>
              <div className="flex justify-center space-x-6">
                {companyData.instagram && (
                  <a
                    href={`https://instagram.com/${companyData.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="h-6 w-6 mr-2" />
                    Instagram
                  </a>
                )}
                {companyData.facebook && (
                  <a
                    href={`https://facebook.com/${companyData.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-6 w-6 mr-2" />
                    Facebook
                  </a>
                )}
                {companyData.tiktok && (
                  <a
                    href={`https://tiktok.com/@${companyData.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-black transition-colors"
                  >
                    <Music className="h-6 w-6 mr-2" />
                    TikTok
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
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

export default Website;
