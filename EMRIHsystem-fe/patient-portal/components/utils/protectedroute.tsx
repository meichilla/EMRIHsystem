import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/app/(auth)/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
  }

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { patientData, refreshToken, expirationTimestamp } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!patientData) {
        // User not authenticated, redirect to login
        console.log('personal data kosong')
        window.location.href = '/signin';
      } else {
        try {
            const isTokenExpired = expirationTimestamp && expirationTimestamp < Date.now();

            if (isTokenExpired) {
              console.log('token expired')
              await refreshToken();
            }
        } catch (error) {
          console.error('Error refreshing tokens:', error);
          // Redirect to login on token refresh failure
          window.location.href = '/signin';
          console.log('catch error token expired')
        }
      }
    };

    fetchData();
  }, [patientData, refreshToken]);

  return <>{patientData && children}</>;
};

export default ProtectedRoute;
