// src/components/OrderCard.jsx
import { Card, Button, Collapse, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const OrderCard = ({ order, onReorder, onReview }) => {
  const firstProduct = order.products[0]; // lấy sản phẩm đầu tiên
  const otherProducts = order.products.slice(1); // còn lại

  return (
    <Card className="mb-4 shadow-md rounded-xl">
      {/* Header đơn hàng */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={firstProduct.image}
            alt={firstProduct.name}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div>
            <h3 className="font-semibold">{firstProduct.name}</h3>
            <p className="text-sm text-gray-500">
              {firstProduct.price.toLocaleString()}₫ x {firstProduct.quantity}
            </p>
          </div>
        </div>

        <Tag color="blue" className="uppercase">
          {order.status}
        </Tag>
      </div>

      {/* Nếu có nhiều sản phẩm thì xổ xuống */}
      {otherProducts.length > 0 && (
        <Collapse
          ghost
          expandIcon={({ isActive }) => (
            <DownOutlined rotate={isActive ? 180 : 0} />
          )}
          className="mt-2"
        >
          <Panel header={`Xem thêm ${otherProducts.length} sản phẩm`} key="1">
            {otherProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <span>{p.name}</span>
                </div>
                <span className="text-gray-600">
                  {p.price.toLocaleString()}₫ x {p.quantity}
                </span>
              </div>
            ))}
          </Panel>
        </Collapse>
      )}

      {/* Tổng tiền */}
      <div className="flex justify-between items-center mt-3 border-t pt-2">
        <span className="text-gray-600">
          Tổng số tiền ({order.products.length} sản phẩm):
        </span>
        <span className="font-semibold text-lg text-red-500">
          {order.total.toLocaleString()}₫
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button onClick={() => onReorder(order)} type="default">
          Mua lại
        </Button>
        {order.isReviewed ? (
          <Button onClick={() => onReview(order)} type="primary">
            Xem đánh giá
          </Button>
        ) : (
          <Button onClick={() => onReview(order)} type="primary">
            Đánh giá
          </Button>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
