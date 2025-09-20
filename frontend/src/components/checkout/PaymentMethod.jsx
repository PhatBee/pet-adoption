export default function PaymentMethod({ value, onChange }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Phương thức thanh toán</h4>
      <label className="block mb-2">
        <input type="radio" name="pm" checked={value === "COD"} onChange={() => onChange("COD")} className="mr-2" /> Thanh toán khi nhận hàng (COD)
      </label>
      <label className="block">
        <input type="radio" name="pm" checked={value === "VNPAY"} onChange={() => onChange("VNPAY")} className="mr-2" /> Thanh toán online (VNPAY)
      </label>
    </div>
  );
}
