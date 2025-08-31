import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Sparkles, Building2, MapPin, Instagram, Facebook, Music, Users, Save, ArrowRight, Phone } from 'lucide-react';
import { DataService } from '../services/dataService';

interface CompanyData {
  name: string;
  town: string;
  description?: string;
  swishNumber?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  owners: string[];
}

const CompanySetup: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    town: '',
    description: '',
    swishNumber: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    owners: ['']
  });

  // Check if user already has company data
  useEffect(() => {
    const checkCompanyData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().companyData) {
          // User already has company data, redirect to dashboard
          navigate('/dashboard', { replace: true });
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking company data:', error);
        setLoading(false);
      }
    };

    checkCompanyData();
  }, [currentUser, navigate]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOwnerChange = (index: number, value: string) => {
    const newOwners = [...companyData.owners];
    newOwners[index] = value;
    setCompanyData(prev => ({
      ...prev,
      owners: newOwners
    }));
  };

  const addOwner = () => {
    setCompanyData(prev => ({
      ...prev,
      owners: [...prev.owners, '']
    }));
  };

  const removeOwner = (index: number) => {
    if (companyData.owners.length > 1) {
      const newOwners = companyData.owners.filter((_, i) => i !== index);
      setCompanyData(prev => ({
        ...prev,
        owners: newOwners
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyData.name.trim() || !companyData.town.trim()) {
      setError('Företagsnamn och stad är obligatoriska fält');
      return;
    }

    if (!currentUser) {
      setError('Du måste vara inloggad');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Clean up empty social media fields and create slug
      const baseSlug = companyData.name.toLowerCase()
        .replace(/[åäö]/g, (match) => {
          const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
          return replacements[match];
        })
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug already exists and add town if needed
      let finalSlug = baseSlug;
      try {
        const { db } = await import('../config/firebase');
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('companyData.slug', '==', baseSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Slug exists, add town name
          const townSlug = companyData.town.toLowerCase()
            .replace(/[åäö]/g, (match) => {
              const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
              return replacements[match];
            })
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          finalSlug = `${baseSlug}-${townSlug}`;
        }
      } catch (error) {
        console.error('Error checking slug uniqueness:', error);
        // If check fails, use base slug as fallback
        finalSlug = baseSlug;
      }

      const cleanData = {
        ...companyData,
        description: companyData.description?.trim() || undefined,
        swishNumber: companyData.swishNumber?.trim() || undefined,
        instagram: companyData.instagram?.trim() || undefined,
        facebook: companyData.facebook?.trim() || undefined,
        tiktok: companyData.tiktok?.trim() || undefined,
        owners: companyData.owners.filter(owner => owner.trim() !== ''),
        slug: finalSlug
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        companyData: cleanData,
        updatedAt: new Date()
      }, { merge: true });

      // Populate cache with initial data (empty products array)
      const initialData = {
        companyData: cleanData,
        products: []
      };
      DataService.cache.set(cleanData.slug, { data: initialData, timestamp: Date.now() });
      console.log('Populated cache with initial company data');

      // Navigate immediately with the company data
      navigate('/dashboard', { 
        replace: true,
        state: { companyData: cleanData }
      });

    } catch (error) {
      console.error('Error saving company data:', error);
      setError('Kunde inte spara företagsinformation. Försök igen.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Välkommen till WebBuilder!
          </h1>
          <p className="text-lg text-gray-600">
            Låt oss börja med att samla information om ditt UF-företag
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-2" />
                Företagsnamn *
              </label>
              <input
                type="text"
                id="name"
                value={companyData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Ange företagsnamn"
                required
              />
            </div>

            {/* Town */}
            <div>
              <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Stad *
              </label>
              <input
                type="text"
                id="town"
                value={companyData.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Ange stad"
                required
              />
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-2" />
                Företagsbeskrivning
                <span className="text-xs text-gray-500 ml-2">(synlig på webbplatsen)</span>
              </label>
              <textarea
                id="description"
                value={companyData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                placeholder="Beskriv ditt företag, vad ni gör, era värderingar eller vad som gör er unika..."
                rows={4}
              />
              <p className="mt-1 text-xs text-gray-500">
                Denna beskrivning kommer att visas på din webbplats för besökare att läsa.
              </p>
            </div>

            {/* Swish Number */}
            <div>
              <label htmlFor="swishNumber" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Swish-nummer
                <span className="text-xs text-gray-500 ml-2">(för framtida betalningar)</span>
              </label>
              <input
                type="tel"
                id="swishNumber"
                value={companyData.swishNumber}
                onChange={(e) => handleInputChange('swishNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="070-123 45 67"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ditt Swish-nummer kommer att visas för kunder när betalningsfunktioner läggs till.
              </p>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Sociala medier (valfritt)</h3>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram className="h-4 w-4 inline mr-2" />
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  value={companyData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="@användarnamn"
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                  <Facebook className="h-4 w-4 inline mr-2" />
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  value={companyData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Facebook-sida eller användarnamn"
                />
              </div>

              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-2">
                  <Music className="h-4 w-4 inline mr-2" />
                  TikTok
                </label>
                <input
                  type="text"
                  id="tiktok"
                  value={companyData.tiktok}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="@användarnamn"
                />
              </div>
            </div>

            {/* Owners */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  <Users className="h-5 w-5 inline mr-2" />
                  Ägare
                </h3>
                <button
                  type="button"
                  onClick={addOwner}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  + Lägg till ägare
                </button>
              </div>

              {companyData.owners.map((owner, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => handleOwnerChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder={`Ägare ${index + 1}`}
                  />
                  {companyData.owners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOwner(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Spara och fortsätt
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
