import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { Sparkles, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const { currentUser, sendVerificationEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Resending verification email...');
      await sendVerificationEmail();
      setSuccess('Verifieringslänk skickad igen! Kontrollera din e-post (och skräppost).');
      console.log('Verification email resent successfully');
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      if (error.code === 'auth/too-many-requests') {
        setError('För många försök. Vänta några minuter innan du försöker igen.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Nätverksfel. Kontrollera din internetanslutning.');
      } else {
        setError('Kunde inte skicka verifieringslänk. Försök igen senare.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fel vid utloggning:', error);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verifiera din e-post
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vi har skickat en verifieringslänk till din e-post
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kontrollera din e-post
              </h3>
              <p className="text-gray-600 mb-4">
                Vi har skickat en verifieringslänk till:
              </p>
              <p className="text-indigo-600 font-medium">{currentUser.email}</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Viktigt:</strong> Klicka på länken i e-postmeddelandet för att verifiera din e-postadress. Du kommer automatiskt att skickas till dashboard efter verifiering.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Skicka igen
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  try {
                    // Force a refresh of the auth state
                    await auth.currentUser?.reload();
                    if (auth.currentUser?.emailVerified) {
                      navigate('/dashboard');
                    } else {
                      setError('E-postadressen är fortfarande inte verifierad. Kontrollera din e-post och klicka på verifieringslänken. Länken kan ta några minuter att komma fram.');
                    }
                  } catch (error) {
                    console.error('Error checking verification status:', error);
                    setError('Kunde inte kontrollera verifieringsstatus. Ladda om sidan manuellt.');
                  }
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Jag har verifierat min e-post
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logga ut
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Kontrollera din skräppost om du inte ser e-postmeddelandet i din inkorg.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
