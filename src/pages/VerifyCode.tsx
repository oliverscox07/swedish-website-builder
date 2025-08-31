import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const VerifyCode: React.FC = () => {
  const { verifyCode, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get email from localStorage or URL params
  const email = localStorage.getItem('pendingVerificationEmail') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) {
      setError('Ange en 6-siffrig kod');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const isValid = await verifyCode(email, code);
      if (isValid) {
        setSuccess('E-post verifierad! Omdirigerar till dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Ogiltig eller utgången kod. Försök igen.');
      }
    } catch (error) {
      setError('Ett fel uppstod. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendVerificationCode(email);
      setSuccess('Ny kod skickad!');
    } catch (error) {
      setError('Kunde inte skicka ny kod. Försök igen.');
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
            Verifiera din e-post
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ange 6-siffrig kod som skickades till {email}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verifieringskod
              </label>
              <input
                id="code"
                name="code"
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="000000"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Ange 6-siffrig kod från din e-post
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Verifiera kod'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={handleResend}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
            >
              Skicka ny kod
            </button>

            <div>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Tillbaka till inloggning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
