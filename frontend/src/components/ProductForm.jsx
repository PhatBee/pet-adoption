import { Link } from "react-router-dom";

export default function ProductGrid({ title, products }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link key={p._id} to={`/products/${p._id}`}>
            <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-2">
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-red-500 font-bold">{p.price}₫</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
