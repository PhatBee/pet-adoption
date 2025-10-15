import React from 'react';
import { format } from 'date-fns';
import { FaCheck, FaClipboardList, FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// 1. Định nghĩa các bước và icon tương ứng
const statusConfig = {
  pending: { text: "Chờ xử lý", icon: <FaClipboardList className="w-3.5 h-3.5" /> },
  confirmed: { text: "Đã xác nhận", icon: <FaCheck className="w-3.5 h-3.5" /> },
  shipping: { text: "Đang giao", icon: <FaTruck className="w-3.5 h-3.5" /> },
  delivered: { text: "Hoàn thành", icon: <FaBox className="w-3.5 h-3.5" /> },
  cancelled: { text: "Đã hủy", icon: <FaTimesCircle className="w-3.5 h-3.5" />, isError: true },
};

const orderedStatusKeys = ["pending", "confirmed", "shipping", "delivered"];

export default function OrderStatusTimeline({ history = [] }) {
  if (!history || history.length === 0) return null;
  
  const historyMap = new Map(history.map(h => [h.status, new Date(h.changedAt)]));
  const currentStatus = history[history.length - 1].status;
  
  // Xử lý trường hợp đơn bị hủy
  if (currentStatus === 'cancelled') {
    const cancelledEvent = history.find(h => h.status === 'cancelled');
    const statusInfo = statusConfig.cancelled;
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="font-semibold text-lg mb-4">Lịch sử đơn hàng</h4>
        <div className="flex items-center gap-3 text-red-600">
          <span className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">{statusInfo.icon}</span>
          <div>
            <p className="font-bold">{statusInfo.text}</p>
            <p className="text-sm text-gray-500">{format(cancelledEvent.changedAt, "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = orderedStatusKeys.indexOf(currentStatus);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h4 className="font-semibold text-lg mb-4">Lịch sử đơn hàng</h4>
      <ol className="items-center sm:flex">
        {orderedStatusKeys.map((statusKey, index) => {
          const statusInfo = statusConfig[statusKey];
          const isCompleted = index <= currentIndex;
          const statusDate = historyMap.get(statusKey);

          return (
            <li key={statusKey} className="relative mb-6 sm:mb-0 flex-1">
              <div className="flex items-center">
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-white ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {isCompleted ? <FaCheckCircle className="w-4 h-4 text-white" /> : statusInfo.icon}
                </div>
                {index < orderedStatusKeys.length - 1 && <div className={`hidden sm:block w-full h-0.5 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </div>
              <div className="mt-3 sm:pr-8">
                <h3 className={`text-md font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{statusInfo.text}</h3>
                {statusDate && (
                  <time className="block text-sm font-normal leading-none text-gray-500">
                    {format(statusDate, "dd/MM/yyyy HH:mm")}
                  </time>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}