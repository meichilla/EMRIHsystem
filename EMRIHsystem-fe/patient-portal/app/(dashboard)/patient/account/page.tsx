'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import AccountContentPage from './accountcontent';

const AccountPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <AccountContentPage />
    </ProtectedRoute>
  );
};

export default AccountPage;
