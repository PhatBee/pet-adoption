import React from "react";

export default function PaymentMethod({ value, onChange }) {
  const methods = [
    {
      key: "COD",
      label: "Thanh toán khi nhận hàng (COD)",
      logo: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
      color: "yellow",
    },
    {
      key: "VNPAY",
      label: "Thanh toán online qua VNPAY",
      logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png",
      color: "indigo",
    },
    {
      key: "MOMO",
      label: "Thanh toán online qua Ví MoMo",
      logo: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
      color: "pink",
    },
  ];

  const colorClasses = {
    yellow: {
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      ring: "focus:ring-yellow-500",
      text: "text-yellow-600",
    },
    indigo: {
      border: "border-indigo-500",
      bg: "bg-indigo-50",
      ring: "focus:ring-indigo-500",
      text: "text-indigo-600",
    },
    pink: {
      border: "border-pink-500",
      bg: "bg-pink-50",
      ring: "focus:ring-pink-500",
      text: "text-pink-600",
    },
  };


  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h4 className="font-semibold text-lg mb-4 border-b pb-2">
        Phương thức thanh toán
      </h4>

      <div className="space-y-3">
        {methods.map((m) => {
          const isSelected = value === m.key;
          const cls = colorClasses[m.color] || colorClasses.blue; 
          return (
            <label
              key={m.key}
              className={`flex items-center gap-3 cursor-pointer border p-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? `border-${m.color}-500 bg-${m.color}-50`
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {/* Logo */}
              <img src={m.logo} alt={`${m.key} logo`} className="h-8 w-auto" />

              {/* Radio + Text */}
              <div className="flex items-center flex-1">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.key}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  className={[
                    "h-4 w-4 border-gray-300",
                    cls.text,
                    cls.ring,
                  ].join(" ")}
                />
                <span className="ml-3 text-gray-800 font-medium">{m.label}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
