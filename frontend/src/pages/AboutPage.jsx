import React from 'react';
import { motion } from 'framer-motion';
import { FaPaw, FaLeaf, FaShippingFast, FaTools, FaGithub, FaLinkedin } from 'react-icons/fa';

// Sample team data - replace photos/links with real ones
const TEAM = [
  {
    id: 't1',
    name: 'Ong Vĩnh Phát',
    role: 'Full-stack',
    bio: 'Fun fact: Listening to music and reading about tech trends during my free time!',
    avatar: 'https://avatars.githubusercontent.com/u/157566580?s=400&u=6399abacfc664571919438dae69317ccaa92a6fb&v=4',
    socials: { github: 'https://github.com/PhatBee', linkedin: 'https://linkedin.com/in/vĩnh-phát-ong-16a374387' }
  },
  {
    id: 't2',
    name: 'Huỳnh Thị Mỹ Tâm',
    role: 'Full-stack',
    bio: '',
    avatar: 'https://avatars.githubusercontent.com/u/157556263?s=400&u=2b158b2bcb9785996b856bd63cb20e690ed4aac5&v=4',
    socials: { github: 'https://github.com/TamaOwO', linkedin: '#' }
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                Pet Store — Nơi yêu thương gặp chăm sóc
              </h1>
              <p className="mt-4 text-gray-600 max-w-xl text-justify">
                Chào mừng đến với Pet Store — nền tảng mua sắm thú cưng và phụ kiện được thiết kế để
                vừa thân thiện với người dùng vừa an toàn cho thú cưng. Chúng tôi kết hợp kiến thức thú y,
                tiêu chuẩn an toàn và trải nghiệm mua hàng hiện đại để giúp bạn chăm sóc người bạn của mình tốt hơn.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Feature icon={<FaPaw size={20} />} title="Sản phẩm chăm sóc" text="Sản phẩm chọn lọc, an toàn, nguồn gốc rõ ràng." />
                <Feature icon={<FaShippingFast size={20} />} title="Giao hàng nhanh" text="Nhiều tùy chọn vận chuyển, đóng gói an toàn." />
              </div>

              <div className="mt-8">
                <a
                  href="/products"
                  className="inline-flex items-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition no-underline"
                >
                  Khám phá sản phẩm
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-w-16 aspect-h-11 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=99b7d2c3b0b6b9f5b2c6c9b9b0f9f1c8"
                  alt="Pets"
                  className="w-full h-full object-cover"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="absolute -bottom-8 left-6 bg-white rounded-xl shadow-lg p-4 w-64"
              >
                <div className="text-sm text-gray-500">Câu chuyện của chúng tôi</div>
                <div className="mt-1 text-gray-800 font-medium">Từ yêu thương đến trách nhiệm</div>
                <p className="text-xs text-gray-500 mt-2 text-justify">Chúng tôi tin rằng mỗi thú cưng xứng đáng được chăm sóc tận tâm — và mọi chủ nuôi nên được hỗ trợ để làm điều đó.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Đội ngũ triển khai</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Những con người đã hiện thực hóa Pet Store — từ thiết kế đến triển khai và vận hành.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <img src={m.avatar} alt={m.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{m.name}</div>
                  <div className="text-sm text-indigo-600">{m.role}</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">{m.bio}</p>

              <div className="mt-4 flex items-center gap-3">
                {m.socials.github && (
                  <a href={m.socials.github} aria-label="github" className="text-gray-500 hover:text-gray-900">
                    <FaGithub />
                  </a>
                )}
                {m.socials.linkedin && (
                  <a href={m.socials.linkedin} aria-label="linkedin" className="text-blue-600 hover:text-blue-800">
                    <FaLinkedin />
                  </a>
                )}

                <div className="ml-auto text-xs text-gray-400">Thành viên #{i + 1}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      
    </main>
  );
}

// Small Feature card component
function Feature({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 inline-flex">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{text}</div>
      </div>
    </div>
  );
}
