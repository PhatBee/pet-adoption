function OrderListPage({ orders = [] }) {
  return (
    <div>
      <h2>Lịch sử mua hàng</h2>
      {orders.length > 0 ? (
        <ul>
          {orders.map(order => (
            <li key={order._id}>
              Đơn {order._id} - {order.status} - {order.total} VND
            </li>
          ))}
        </ul>
      ) : (
        <p>Bạn chưa có đơn hàng nào</p>
      )}
    </div>
  );
}

export default OrderListPage;