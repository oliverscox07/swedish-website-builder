import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';
import VerifyCode from './pages/VerifyCode';
import CompanySetup from './pages/CompanySetup';
import EditCompany from './pages/EditCompany';
import ProductManagement from './pages/ProductManagement';
import Website from './pages/Website';
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route 
              path="/company-setup" 
              element={
                <ProtectedRoute requireEmailVerification={true} requireCompanySetup={false}>
                  <CompanySetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-company" 
              element={
                <ProtectedRoute>
                  <EditCompany />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/website/:slug" 
              element={<Website />} 
            />
            <Route 
              path="/website/:slug/product/:productId" 
              element={<ProductDetail />} 
            />
            <Route 
              path="/verify-email" 
              element={
                <ProtectedRoute requireEmailVerification={false}>
                  <VerifyEmail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
