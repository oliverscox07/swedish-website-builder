import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Sparkles, LogOut, Plus, Globe, Edit, Trash2, Eye, Building2, MapPin, Instagram, Facebook, Music, Users, Package, ExternalLink, Settings, Shield, AlertTriangle } from 'lucide-react';
import { DataService } from '../services/dataService';
import { SAFETY_CONFIG } from '../config/safety';

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

interface CompanyData {
  name: string;
  town: string;
  description?: string;
  swishNumber?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  owners: string[];
  slug?: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readStats, setReadStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      // Check if we have company data from navigation state
      const state = location.state as { companyData?: CompanyData } | null;
      if (state?.companyData) {
        setCompanyData(state.companyData);
        setLoading(false);
        return;
      }
      
      try {
        // Load company data from Firebase
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.companyData) {
            setCompanyData(userData.companyData);
          }
        }

        // Load products from subcollection
        const productsRef = collection(db, 'users', currentUser.uid, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        const productsData: any[] = [];
        productsSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          productsData.push({
            id: data.id || docSnapshot.id,
            name: data.name,
            description: data.description,
            price: data.price,
            type: data.type,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          });
        });
        
        setProducts(productsData);
      } catch (error) {
        console.error('Fel vid laddning av data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load read stats for safety monitoring
    const stats = DataService.getReadStats();
    setReadStats(stats);

    loadData();
  }, [currentUser, location.state]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Fel vid utloggning:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar din dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WebBuilder</span>
            </div>
          <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Välkommen, {currentUser?.email}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentUser?.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentUser?.emailVerified ? 'E-post verifierad' : 'E-post ej verifierad'}
              </span>
            <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
                <LogOut className="h-4 w-4 mr-1" />
                Logga ut
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Välkommen tillbaka!</h1>
          <p className="text-gray-600">Hantera ditt företag och produkter</p>
        </div>

        {/* Safety Status */}
        {readStats && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              readStats.dailyReads >= readStats.maxDailyReads * SAFETY_CONFIG.WARNING_THRESHOLD
                ? 'bg-red-50 border-red-200' 
                : readStats.dailyReads >= readStats.maxDailyReads * SAFETY_CONFIG.CAUTION_THRESHOLD
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className={`h-5 w-5 mr-2 ${
                    readStats.dailyReads >= readStats.maxDailyReads * SAFETY_CONFIG.WARNING_THRESHOLD
                      ? 'text-red-600' 
                      : readStats.dailyReads >= readStats.maxDailyReads * SAFETY_CONFIG.CAUTION_THRESHOLD
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`} />
                  <span className="font-medium text-gray-900">Firestore Säkerhet</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Läsningar idag: <span className="font-semibold">{readStats.dailyReads}</span> / {readStats.maxDailyReads}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cache: {readStats.cacheSize} / {readStats.maxCacheSize}
                  </div>
                </div>
              </div>
              {readStats.dailyReads >= readStats.maxDailyReads * SAFETY_CONFIG.WARNING_THRESHOLD && (
                <div className="mt-2 flex items-center text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Varning: Nästan uppnått daglig läsgräns!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Information */}
        {companyData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Företagsinformation</h3>
                      <button
                onClick={() => navigate('/edit-company')}
                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Redigera
                      </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Företagsnamn</span>
                </div>
                <p className="text-gray-900">{companyData.name}</p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Stad</span>
                </div>
                <p className="text-gray-900">{companyData.town}</p>
              </div>

              {companyData.owners.length > 0 && (
                <div className="md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Ägare</span>
                  </div>
                  <p className="text-gray-900">{companyData.owners.join(', ')}</p>
                </div>
              )}

              {(companyData.instagram || companyData.facebook || companyData.tiktok) && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sociala medier</h4>
                  <div className="flex flex-wrap gap-4">
                    {companyData.instagram && (
                      <div className="flex items-center">
                        <Instagram className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-900">{companyData.instagram}</span>
                      </div>
                    )}
                    {companyData.facebook && (
                      <div className="flex items-center">
                        <Facebook className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-900">{companyData.facebook}</span>
                      </div>
                    )}
                    {companyData.tiktok && (
                      <div className="flex items-center">
                        <Music className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-900">{companyData.tiktok}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
                </div>
              </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Produkter & Tjänster</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Hantera dina produkter och tjänster
            </p>
                      <button
              onClick={() => navigate('/products')}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
              <Plus className="h-4 w-4 mr-2" />
              Hantera produkter
                      </button>
                    </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Din webbplats</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Visa din automatiska webbplats
            </p>
            <a
              href={`/website/${companyData?.slug || currentUser?.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visa webbplats
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Företagsinfo</h3>
                    </div>
            <p className="text-gray-600 mb-4">
              Redigera företagsinformation
            </p>
                      <button
              onClick={() => navigate('/edit-company')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
              <Edit className="h-4 w-4 mr-2" />
              Redigera företag
                      </button>
                    </div>
                  </div>

        {/* Products Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Produkter & Tjänster</h3>
            <span className="text-sm text-gray-500">{products.length} st</span>
                </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Inga produkter än</h4>
              <p className="text-gray-600 mb-4">
                Lägg till din första produkt eller tjänst för att komma igång
              </p>
                      <button
                onClick={() => navigate('/products')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                Lägg till första produkten
                      </button>
                    </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {product.type === 'product' ? (
                        <Package className="h-4 w-4 text-indigo-600 mr-2" />
                      ) : (
                        <Settings className="h-4 w-4 text-green-600 mr-2" />
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
                  <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <span className="text-lg font-bold text-indigo-600">{product.price} SEK</span>
                </div>
              ))}
              {products.length > 3 && (
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                  <button
                    onClick={() => navigate('/products')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Visa alla ({products.length} st)
                  </button>
                </div>
              )}
          </div>
        )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
