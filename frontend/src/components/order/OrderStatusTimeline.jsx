import React from "react";

export default function OrderStatusTimeline({ history = [] }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-3">Lịch sử trạng thái</h4>
      <ul className="space-y-3">
        {history.map((h, idx) => (
          <li key={idx} className="flex justify-between">
            <div>
              <div className="font-medium">{h.status}</div>
              <div className="text-sm text-gray-500">{new Date(h.changedAt).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
