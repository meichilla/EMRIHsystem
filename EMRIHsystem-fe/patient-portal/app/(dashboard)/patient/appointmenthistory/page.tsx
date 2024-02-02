'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import AppointmentHistoryPage from './appointmenthistorycontent';

const HomePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <AppointmentHistoryPage />
    </ProtectedRoute>
  );
};

export default HomePage;
