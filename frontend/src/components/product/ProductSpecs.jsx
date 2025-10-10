import React from 'react';

export default function ProductSpecs({ product }) {
  // Tạo một danh sách các thông số cần hiển thị
  const specs = [
    { label: 'Thương hiệu', value: product.brand },
    { label: 'Nhà sản xuất', value: product.manufacturer },
    { label: 'Xuất xứ', value: product.country },
    { label: 'Cân nặng', value: product.itemWeight },
    { label: 'Kích thước', value: product.dimensions },
  ];

  // Lọc ra chỉ những thông số có giá trị (không rỗng, không null)
  const availableSpecs = specs.filter(spec => spec.value);

  // Nếu không có thông số nào, không hiển thị gì cả
  if (availableSpecs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold border-b pb-2 mb-3">Thông số kỹ thuật</h3>
      <table className="w-full text-sm">
        <tbody>
          {availableSpecs.map((spec, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-2 bg-gray-50 font-medium text-gray-600 w-1/3">{spec.label}</td>
              <td className="py-2 px-2 text-gray-800">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}