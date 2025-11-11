import React, { useContext, useEffect } from 'react';
import { CMSContext } from '../contexts/CMSContext';
import { motion } from 'framer-motion';
import '../styles/Home.css';

// Constants
const DEFAULT_CONTENT = {
  hero: {
    title: 'virtualign.id',
    subtitle: 'Virtual tour interaktif berbasis teknologi 3D',
  },
};

// Component Parts
const LoadingSpinner = () => (
  <div className="loading-page">
    <div className="loading-spinner" />
    <p style={{ marginTop: '1rem', color: '#999' }}>Loading...</p>
  </div>
);

const HeroSection = ({ content }) => (
  <section className="hero">
    <div className="hero-container">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">{content.hero?.title || 'Buat Virtual Tour yang Membanggakan Anda'}</h1>
        <p className="hero-subtitle">{content.hero?.subtitle || 'Luncurkan platform vitual tour kustomisasi Anda tanpa hambatan. Tampilkan pengalaman 3D dan ruang interaktif yang unik, fitur lengkap, responsif di semua perangkat.'}</p>
        <motion.button 
          className="hero-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/virtual-tour'}
        >
          Mulai →
        </motion.button>
      </motion.div>
      
      <motion.div
        className="hero-preview"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="preview-card preview-card-1">
          <div className="preview-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="mockup-content">
              <div 
                className="mockup-image"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/image.png)` }}
              ></div>
              <div className="mockup-text">
                <div className="line"></div>
                <div className="line short"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="preview-card preview-card-2">
          <div className="preview-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="mockup-content">
              <div 
                className="mockup-image circle"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/logo.png)` }}
              ></div>
              <div className="mockup-text">
                <div className="line"></div>
                <div className="line short"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="preview-card preview-card-3">
          <div className="preview-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="mockup-content wide">
              <div 
                className="mockup-image wide"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/image2.png)` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const VirtualTourSection = ({ content }) => (
  <section id="virtual-tour" className="virtual-tour-section">
    <motion.div
      className="virtual-tour-container"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="virtual-tour-text">
        <h2 className="virtual-tour-title">
          {content.virtualTour?.title || 'Rasakan Pengalaman Virtual Tour Interaktif dalam 3D'}
        </h2>
        <p className="virtual-tour-description">
          {content.virtualTour?.description || 'Jelajahi ruang dan lingkungan dalam format 360-degree yang immersive. Dengan teknologi Unity 3D, kami menghadirkan pengalaman virtual tour yang realistis, interaktif, dan dapat diakses dari perangkat apa pun.'}
        </p>
      </div>
    </motion.div>
  </section>
);

const ServicesSection = ({ content }) => {
  const defaultServices = [
    { 
      title: 'Sesuaikan situs Anda', 
      desc: 'Pilih template dan tata letak dari situs kami. Anda juga dapat merancang tampilan Anda sendiri, menambahkan halaman, dan mengatur navigasi sesuai kebutuhan virtual tour Anda.' 
    },
    { 
      title: 'Tambahkan fitur canggih', 
      desc: 'Mudah konfigurasi fitur-fitur canggih seperti VR mode, hotspot interaktif, audio guide, dan integrasi multimedia untuk pengalaman virtual tour yang lebih immersive.' 
    },
    { 
      title: 'Edit tampilan sesuai keinginan', 
      desc: 'Lihat versi situs yang dikustomisasi untuk seluruh ruang dan space. Sesuaikan desain sesuai branding Anda dengan tools yang mudah digunakan.' 
    },
    { 
      title: 'Optimisasi untuk mesin pencari', 
      desc: 'Dengan tools SEO yang terintegrasi, virtual tour Anda dapat ditemukan dengan mudah. Tingkatkan ranking situs Anda, visibilitas online, dan jangkauan audiens lebih luas.' 
    },
  ];

  const services = content.services?.items || defaultServices;
  const mainTitle = content.services?.mainTitle || 'Kebebasan untuk Membuat Virtual Tour yang Anda Inginkan';

  return (
    <section id="services" className="services-section">
      <motion.div 
        className="services-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="services-content">
          <motion.h2 
            className="services-main-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {mainTitle}
          </motion.h2>
          
          <div className="services-list">
            {services.map((s, i) => (
              <motion.div 
                key={i} 
                className="service-item" 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <h3 className="service-item-title">{s.title}</h3>
                <p className="service-item-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.button 
            className="services-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = '/virtual-tour'}
          >
            Mulai Sekarang →
          </motion.button>
        </div>
        
        <motion.div 
          className="services-preview"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="preview-browser">
            <div className="browser-header">
              <div className="browser-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="browser-url">www.virtualign.id</div>
            </div>
            <div className="browser-content">
              <img 
                src={`${process.env.PUBLIC_URL}/assets/image.png`} 
                alt="Virtual Tour Preview" 
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const AdvantagesSection = ({ content }) => {
  const defaultAdvantages = [
    { 
      title: 'Teknologi Terdepan', 
      desc: 'Pengalaman VR immersive dengan teknologi 360-degree walkthrough dan augmented reality (AR) terkini untuk virtual tour yang realistis.' 
    },
    { 
      title: 'Kualitas Visual Terbaik', 
      desc: 'Rendering berkualitas tinggi dengan detail maksimal, texture realistic, dan lighting yang sempurna untuk pengalaman visual yang memukau.' 
    },
    { 
      title: 'Solusi Inovatif', 
      desc: 'Platform interaktif yang meningkatkan engagement dan daya tarik bisnis Anda dengan fitur-fitur canggih dan user-friendly interface.' 
    },
    { 
      title: 'Tim Profesional', 
      desc: 'Didukung oleh tim berpengalaman dan berdedikasi untuk menghasilkan virtual tour terbaik sesuai kebutuhan dan visi Anda.' 
    },
  ];

  const advantages = content.advantages?.items || defaultAdvantages;
  const label = content.advantages?.label || 'KEUNGGULAN';
  const mainTitle = content.advantages?.mainTitle || 'Mengapa Memilih Kami?';

  return (
    <section id="advantages" className="advantages-section">
      <motion.div 
        className="advantages-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="advantages-content">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {label}
          </motion.span>
          
          <motion.h2 
            className="advantages-main-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {mainTitle}
          </motion.h2>
          
          <div className="advantages-list">
            {advantages.map((a, i) => (
              <motion.div
                className="advantage-item"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="advantage-item-title">{a.title}</h3>
                <p className="advantage-item-desc">{a.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.button 
            className="advantages-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            Pelajari Lebih Lanjut →
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

// Main Component
function Home() {
  const { content, loading } = useContext(CMSContext);

  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll');
    els.forEach((el) => el.classList.add('animate-in'));
  }, []);

  if (loading) return <LoadingSpinner />;

  const pageContent = content || DEFAULT_CONTENT;

  return (
    <div className="home-page">
      <HeroSection content={pageContent} />
      <VirtualTourSection content={pageContent} />
      <ServicesSection content={pageContent} />
      <AdvantagesSection content={pageContent} />
    </div>
  );
}

export default Home;
