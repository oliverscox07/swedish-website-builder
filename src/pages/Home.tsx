import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">WebBuilder</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logga in
              </Link>
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Kom igång
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bygg din webbplats
              <span className="text-indigo-600"> på minuter</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Skapa vackra, professionella webbplatser utan kodkunskaper. 
              Perfekt för studenter, entreprenörer och småföretag.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Börja bygga
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors">
                Se demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Allt du behöver för att lyckas
            </h2>
            <p className="text-xl text-gray-600">
              Kraftfulla funktioner designade för att göra webbplatskreation enkel och effektiv
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Blixtsnabb</h3>
              <p className="text-gray-600">
                Bygg din webbplats på minuter med vårt intuitiva drag-and-drop gränssnitt
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Säker & Pålitlig</h3>
              <p className="text-gray-600">
                Din data är säker med företagsgrad säkerhet och 99,9% drifttid
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vackra mallar</h3>
              <p className="text-gray-600">
                Välj bland hundratals professionellt designade mallar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Redo att komma igång?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Gå med tusentals användare som redan har skapat sin perfekta webbplats
          </p>
          <Link
            to="/login"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Skapa din webbplats
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-lg font-bold">WebBuilder</span>
            </div>
            <p className="text-gray-400">
              © 2024 WebBuilder. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
