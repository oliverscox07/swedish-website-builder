import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Eye, EyeOff, AlertCircle, CheckCircle, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  const { login, register, sendVerificationCode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        const user = await register(email, password);
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', email);
        // Redirect to verification page
        navigate('/verify-code');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Denna e-postadress används redan. Logga in istället.');
      } else if (error.code === 'auth/weak-password') {
        setError('Lösenordet måste vara minst 6 tecken långt.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Ogiltig e-postadress.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Inget konto hittades med denna e-postadress.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Felaktigt lösenord.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Detta konto har inaktiverats.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('För många försök. Försök igen senare.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Nätverksfel. Kontrollera din internetanslutning.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('E-postregistrering är inte aktiverat. Kontakta support.');
      } else {
        console.error('Authentication error:', error);
        setError(error.message || 'Ett fel uppstod. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Välkommen tillbaka' : 'Skapa ditt konto'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Logga in på ditt konto' : 'Börja bygga din webbplats idag'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-postadress
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Ange din e-postadress"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Lösenord
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder={isLogin ? "Ange ditt lösenord" : "Skapa ett lösenord (minst 6 tecken)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isLogin ? 'Logga in' : 'Skapa konto'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setShowVerificationMessage(false);
              }}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
            >
              {isLogin ? "Har du inget konto? Registrera dig" : 'Har du redan ett konto? Logga in'}
            </button>

            {showVerificationMessage && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Fick du ingen e-post?</p>
                <button
                  onClick={async () => {
                    try {
                      console.log('Resending verification code from login page...');
                      await sendVerificationCode(email);
                      setSuccess('Verifieringskod skickad igen! Kontrollera din e-post (och skräppost).');
                    } catch (error: any) {
                      console.error('Error resending from login page:', error);
                      setError('Kunde inte skicka verifieringskod. Försök igen.');
                    }
                  }}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Skicka igen
                </button>
                

              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
