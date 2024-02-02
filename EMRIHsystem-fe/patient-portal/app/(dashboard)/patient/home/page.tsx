'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import HomeContentPage from './homecontent';

const HomePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <HomeContentPage />
    </ProtectedRoute>
  );
};

export default HomePage;
