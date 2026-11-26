import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#142C38]/5 border border-[#C5A46D]/30 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-[#C5A46D] animate-spin" />
        </div>
        <h2 className="text-xl font-serif text-[#142C38] tracking-tight mb-2">
          Verifying Authorization
        </h2>
        <p className="text-sm font-sans text-[#666666] max-w-sm">
          Confirming administrator credentials with AMMAN REAL ESTATE secure database...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect unauthorized callers to /admin/login preserving intended URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
