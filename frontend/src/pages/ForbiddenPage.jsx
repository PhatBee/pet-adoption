import React from 'react';
import ErrorPage from './ErrorPage';

export default function ForbiddenPage() {
  return (
    <ErrorPage 
      statusCode="403"
      title="Truy cập bị từ chối"
      message="Rất tiếc, bạn không có quyền truy cập vào trang này."
    />
  );
}