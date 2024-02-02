'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import NotificationContentPage from './notificationcontent';

const NotificationPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <NotificationContentPage />
    </ProtectedRoute>
  );
};

export default NotificationPage;
