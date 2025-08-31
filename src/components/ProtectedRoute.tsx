import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireCompanySetup?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailVerification = true,
  requireCompanySetup = true 
}) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [hasCompanyData, setHasCompanyData] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Check if we have company data from navigation state
      const state = location.state as { companyData?: any } | null;
      if (state?.companyData) {
        setIsVerified(true);
        setHasCompanyData(true);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsVerified(userData.emailVerified || false);
          setHasCompanyData(!!userData.companyData);
        } else {
          setIsVerified(false);
          setHasCompanyData(false);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        setIsVerified(false);
        setHasCompanyData(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserData();
  }, [currentUser, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kontrollerar...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireEmailVerification && !isVerified) {
    return <Navigate to="/verify-code" />;
  }

  if (requireCompanySetup && !hasCompanyData) {
    return <Navigate to="/company-setup" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
