import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage({
  statusCode = "404",
  title = "Không tìm thấy trang",
  message = "Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-blue-600">{statusCode}</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base text-gray-500">
          {message}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}