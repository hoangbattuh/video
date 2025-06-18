import React from 'react';
import { motion } from 'framer-motion';
import { FaCut, FaLink, FaVolumeMute, FaBrain, FaRocket, FaMobileAlt } from 'react-icons/fa';
import './Home.css';

// Component Banner riêng biệt
const Banner = () => {
  return (
    <motion.section
      className="intro-banner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <img src="banner-placeholder.png" alt="Banner Giới thiệu" />
    </motion.section>
  );
};

export default function Home() {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="home-page">
      <motion.header
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>🎞 Video Editor Pro</h1>
        <p className="subtitle">
          Phần mềm chỉnh sửa video mạnh mẽ dành cho TikTok, YouTube và các nền tảng mạng xã hội.
        </p>
      </motion.header>

      <Banner />

      <section className="feature-section">
        <h2 className="section-title">🚀 Tính năng nổi bật</h2>
        <motion.div
          className="features-grid"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <FeatureCard
            icon={<FaCut />}
            title="Cắt Video"
            desc="Chọn đoạn thời gian và tách cảnh thông minh."
            variants={featureVariants}
          />
          <FeatureCard
            icon={<FaLink />}
            title="Ghép Video"
            desc="Sắp xếp, kéo thả, thêm hiệu ứng chuyển cảnh."
            variants={featureVariants}
          />
          <FeatureCard
            icon={<FaVolumeMute />}
            title="Xóa Âm thanh"
            desc="Tách âm, thay nhạc nền, lọc tiếng ồn."
            variants={featureVariants}
          />
          <FeatureCard
            icon={<FaBrain />}
            title="Phụ đề AI"
            desc="Tạo phụ đề tự động bằng AI Whisper, hỗ trợ đa ngôn ngữ."
            variants={featureVariants}
          />
          <FeatureCard
            icon={<FaRocket />}
            title="Xử lý Hàng loạt"
            desc="Tạo pipeline & áp dụng cho nhiều video cùng lúc."
            variants={featureVariants}
          />
          <FeatureCard
            icon={<FaMobileAlt />}
            title="Preset TikTok/YouTube"
            desc="Tự động tối ưu khung hình, bitrate & định dạng."
            variants={featureVariants}
          />
        </motion.div>
      </section>

      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h2>🎬 Sẵn sàng bắt đầu chỉnh sửa?</h2>
        <p>Chọn một công cụ ở thanh menu trên để bắt đầu quá trình xử lý video của bạn.</p>
      </motion.section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, variants }) {
  return (
    <motion.div
      className="feature-card"
      variants={variants}
      whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}