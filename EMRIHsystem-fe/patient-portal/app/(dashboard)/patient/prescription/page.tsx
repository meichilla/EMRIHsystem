'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import PrescriptionContent from './prescriptioncontent';

const HomePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <PrescriptionContent />
    </ProtectedRoute>
  );
};

export default HomePage;
