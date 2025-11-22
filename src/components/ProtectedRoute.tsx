import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute check:', { loading, hasUser: !!user });
    
    if (!loading && !user) {
      console.log('Redirecting to auth - no user');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, returning null');
    return null;
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};
