'use client'

import ProtectedRoute from '@/components/utils/protectedroute';
import DocumentContent from './documentcontent';

const Documents: React.FC = () => {
  return (
    <ProtectedRoute>
      <DocumentContent />
    </ProtectedRoute>
  );
};

export default Documents;
