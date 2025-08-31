import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CompleteSignup: React.FC = () => {
  const { checkSignInLink } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const completeSignup = async () => {
      try {
        console.log('Checking for sign-in link...');
        const isSignInLink = await checkSignInLink();
        
        if (isSignInLink) {
          console.log('Sign-in link processed successfully');
          setSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          console.log('No sign-in link found, redirecting to login');
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Error completing signup:', error);
        setError('Ett fel uppstod vid slutförande av registreringen. Försök igen.');
      } finally {
        setLoading(false);
      }
    };

    completeSignup();
  }, [checkSignInLink, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Slutför registreringen
            </h2>
            <div className="mt-8 flex justify-center">
              <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
            <p className="mt-4 text-gray-600">
              Bearbetar din inloggningslänk...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Registrering misslyckades
            </h2>
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Gå tillbaka till inloggning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Registrering slutförd!
            </h2>
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-600">
                  Din registrering har slutförts framgångsrikt!
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-gray-600">
                Omdirigerar till dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CompleteSignup;
