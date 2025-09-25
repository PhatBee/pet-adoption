export default function AddressDisplay({ address }) {
  if (!address) return null;
  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">Địa chỉ nhận hàng</h4>
      <div className="text-sm">
        <div className="font-medium">{address.fullName} • {address.phone}</div>
        <div className="text-gray-600">{address.street}{address.ward ? `, ${address.ward}` : ""}{address.district ? `, ${address.district}` : ""}, {address.city}</div>
      </div>
    </div>
  );
}
