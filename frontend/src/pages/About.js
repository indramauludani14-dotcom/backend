// src/pages/About.js
import React, { useEffect, useRef, useContext } from 'react';
import { CMSContext } from '../contexts/CMSContext';
import '../styles/About.css';

// ==================== COMPONENTS ====================

const SectionHeader = ({ label, title, description }) => (
  <div className="section-header-center">
    <span className="section-label">{label}</span>
    <h2 className="section-title">{title}</h2>
    {description && <p className="section-desc">{description}</p>}
  </div>
);

const HeroSection = ({ aboutData }) => (
  <section className="about-hero" aria-label="Tentang Kami">
    <div className="container">
      <div className="hero-content">
        <span className="hero-label">{aboutData?.hero?.label || 'Tentang Kami'}</span>
        <h1>{aboutData?.hero?.title || 'CV. Virtualign Inova Cipta'}</h1>
        <p className="hero-description">
          {aboutData?.hero?.description || 'Perusahaan pengembang teknologi visualisasi digital yang berfokus pada pembuatan Virtual Room Tour interaktif untuk berbagai industri — menghadirkan solusi digital yang inovatif, elegan, dan berdaya guna.'}
        </p>
      </div>
    </div>
  </section>
);

const ProfileSection = ({ aboutData }) => {
  const logoWrapRef = useRef(null);

  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const wrap = logoWrapRef.current;
    if (!wrap) return;
    const logo = wrap.querySelector('.logo-3d');
    if (!logo) return;

    const maxX = 16; // deg rotateX
    const maxY = 24; // deg rotateY

    const handleEnter = (e) => {
      logo.style.animationPlayState = 'paused';
    };

    const handleMove = (e) => {
      // Only react to mouse to avoid jumpy touch behavior
      if (e.pointerType && e.pointerType !== 'mouse') return;

      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotX = (-y * 2) * maxX; // invert so cursor up tilts up
      const rotY = (x * 2) * maxY;

      logo.style.willChange = 'transform';
      logo.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-2px) translateZ(16px)`;
    };

    const handleLeave = () => {
      logo.style.animationPlayState = '';
      logo.style.transform = '';
      logo.style.willChange = '';
    };

    wrap.addEventListener('pointerenter', handleEnter);
    wrap.addEventListener('pointermove', handleMove);
    wrap.addEventListener('pointerleave', handleLeave);

    return () => {
      wrap.removeEventListener('pointerenter', handleEnter);
      wrap.removeEventListener('pointermove', handleMove);
      wrap.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <section className="about-section section-profile" aria-label="Profil Perusahaan">
      <div className="container">
        <div className="profile-content">
          <div className="profile-image">
            <div className="image-placeholder" role="img" aria-label="Logo perusahaan">
              <div className="logo-3d-wrap" ref={logoWrapRef}>
                <div className="logo-3d">
                  <img src="/assets/logo.png" alt="Logo perusahaan" className="profile-logo" loading="lazy" />
                  <span className="logo-shine" aria-hidden="true"></span>
                </div>
              </div>
              <span className="placeholder-icon" />
            </div>
          </div>
          <div className="profile-text">
            <span className="section-label">{aboutData?.profile?.label || 'Profil Perusahaan'}</span>
            <h2 className="section-title">{aboutData?.profile?.title || 'Solusi Digital Inovatif untuk Masa Depan'}</h2>
            <p className="section-desc">
              {aboutData?.profile?.description || 'CV. Virtualign Inova Cipta menyediakan solusi interaktif dan inovatif untuk properti, museum, gedung bersejarah, manufaktur, pameran, dan galeri seni. Selain itu, kami menghadirkan marketplace online untuk pemasaran karya seni, menghubungkan seniman, kolektor, dan pecinta seni di berbagai penjuru dunia.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const TimelineSection = ({ aboutData }) => (
  <section className="about-section section-timeline" aria-label="Sejarah dan Milestone">
    <div className="container">
      <SectionHeader
        label={aboutData?.timeline?.label || 'Perjalanan Kami'}
        title={aboutData?.timeline?.title || 'Sejarah & Milestone'}
      />
      <div className="timeline">
        {(aboutData?.timeline?.items || []).map((item, idx) => (
          <div
            key={idx}
            className="timeline-item"
            style={{ '--delay': `${idx * 0.2}s` }}
          >
            <div className="timeline-year">{item.year}</div>
            <div className="timeline-content">
              <h3 className="timeline-title">{item.event}</h3>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const VisionMissionSection = ({ aboutData }) => (
  <section className="about-section section-vision-mission" aria-label="Visi dan Misi">
    <div className="container">
      <div className="vm-grid">
        <div className="vm-card vision-card">
          <span className="vm-label">{aboutData?.vision?.label || 'Visi Kami'}</span>
          <h2 className="vm-title">{aboutData?.vision?.title || 'Memimpin Inovasi Digital'}</h2>
          <p className="vm-text">
            {aboutData?.vision?.text || 'Menjadi pemimpin dalam inovasi digital dengan menghadirkan pengalaman virtual tour yang imersif dan interaktif tanpa batas aksesibilitas.'}
          </p>
        </div>

        <div className="vm-card mission-card">
          <span className="vm-label">{aboutData?.mission?.label || 'Misi Kami'}</span>
          <h2 className="vm-title">{aboutData?.mission?.title || 'Transformasi Digital'}</h2>
          <ul className="mission-list">
            {(aboutData?.mission?.items || []).map((mission, idx) => (
              <li key={idx} style={{ '--delay': `${idx * 0.1}s` }}>
                <span className="mission-bullet" aria-hidden>•</span>
                <span>{mission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const ValuesSection = ({ aboutData }) => (
  <section className="about-section section-values" aria-label="Nilai Perusahaan">
    <div className="container">
      <SectionHeader
        label={aboutData?.values?.label || 'Nilai Kami'}
        title={aboutData?.values?.title || 'Prinsip yang Kami Pegang'}
      />
      <div className="values-grid">
        {(aboutData?.values?.items || []).map((value, idx) => (
          <div
            key={idx}
            className="value-card"
            style={{ '--delay': `${idx * 0.1}s` }}
          >
            <h3 className="value-title">{value.title}</h3>
            <p className="value-desc">{value.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PhilosophySection = ({ aboutData }) => (
  <section className="about-section section-philosophy" aria-label="Filosofi Perusahaan">
    <div className="container">
      <div className="philosophy-box">
        <h2 className="philosophy-title">{aboutData?.philosophy?.title || 'Filosofi Perusahaan'}</h2>
        <p className="philosophy-quote">
          {aboutData?.philosophy?.quote || '"Membuka Gerbang ke Dunia Virtual, Menyatukan Kreativitas dan Teknologi"'}
        </p>
      </div>
    </div>
  </section>
);

const ServicesSection = ({ aboutData }) => (
  <section className="about-section section-services" aria-label="Layanan Kami">
    <div className="container">
      <SectionHeader
        label={aboutData?.services?.label || 'Layanan Kami'}
        title={aboutData?.services?.title || 'Solusi Digital Terbaik'}
      />
      <div className="services-grid">
        {(aboutData?.services?.items || []).map((service, idx) => (
          <div
            key={idx}
            className="service-card"
            style={{ '--delay': `${idx * 0.1}s` }}
          >
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.desc}</p>
            <div className="service-arrow" aria-hidden>→</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AdvantagesSection = ({ aboutData }) => (
  <section className="about-section section-advantages" aria-label="Keunggulan">
    <div className="container">
      <div className="advantages-split">
        <div className="advantages-left">
          <span className="section-label">{aboutData?.advantages?.label || 'Keunggulan'}</span>
          <h2 className="section-title">{aboutData?.advantages?.title || 'Mengapa Memilih Kami?'}</h2>
          <p className="section-desc">
            {aboutData?.advantages?.description || 'Kami menawarkan kombinasi sempurna antara teknologi terdepan dan layanan profesional'}
          </p>
        </div>
        <div className="advantages-right">
          {(aboutData?.advantages?.items || []).map((advantage, idx) => (
            <div
              key={idx}
              className="advantage-item"
              style={{ '--delay': `${idx * 0.1}s` }}
            >
              <p className="advantage-text">{advantage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const TargetMarketSection = ({ aboutData }) => (
  <section className="about-section section-target" aria-label="Target Pasar">
    <div className="container">
      <div className="target-split">
        <div className="target-left">
          <span className="section-label">{aboutData?.targetMarket?.label || 'Target Pasar'}</span>
          <h2 className="section-title">{aboutData?.targetMarket?.title || 'Klien Potensial Kami'}</h2>
        </div>
        <div className="target-right">
          {(aboutData?.targetMarket?.items || []).map((target, idx) => (
            <div
              key={idx}
              className="target-item"
              style={{ '--delay': `${idx * 0.1}s` }}
            >
              <p className="target-text">{target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ==================== MAIN COMPONENT ====================

function About() {
  const { content } = useContext(CMSContext);
  const aboutData = content?.about || {};

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const sections = document.querySelectorAll('.about-section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <HeroSection aboutData={aboutData} />
      <ProfileSection aboutData={aboutData} />
      <TimelineSection aboutData={aboutData} />
      <VisionMissionSection aboutData={aboutData} />
      <ValuesSection aboutData={aboutData} />
      <PhilosophySection aboutData={aboutData} />
      <ServicesSection aboutData={aboutData} />
      <AdvantagesSection aboutData={aboutData} />
      <TargetMarketSection aboutData={aboutData} />
    </div>
  );
}

export default About;
