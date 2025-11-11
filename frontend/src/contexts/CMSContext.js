// src/contexts/CMSContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const CMSContext = createContext();

function CMSProvider({ children }) {
  // Default content sebagai fallback
  const getDefaultContent = () => ({
    hero: {
      title: 'virtualign.id',
      subtitle: 'Virtual tour interaktif berbasis teknologi 3D',
      primary_button: 'Try Layout App',
      secondary_button: 'Virtual Tour',
    },
    virtualTour: {
      label: 'VIRTUAL TOUR',
      mainTitle: 'Jelajahi Ruang dengan Virtual Tour 360°',
      description: 'Navigasi interaktif berbasis Unity WebGL untuk pengalaman imersif yang menakjubkan.',
      items: [
        {
          title: 'Navigasi Bebas 360°',
          desc: 'Jelajahi setiap sudut ruangan dengan kontrol penuh menggunakan mouse atau keyboard.'
        },
        {
          title: 'Teknologi Unity WebGL',
          desc: 'Rendering real-time berkualitas tinggi langsung di browser Anda.'
        },
        {
          title: 'Responsif & Cepat',
          desc: 'Optimisasi performa untuk pengalaman smooth di berbagai perangkat.'
        }
      ]
    },
    services: {
      mainTitle: 'Kebebasan untuk Membuat Virtual Tour yang Anda Inginkan',
      items: [
        {
          title: 'Kontrol Penuh',
          desc: 'Atur setiap detail ruangan sesuai keinginan Anda dengan kontrol yang mudah dan intuitif.'
        },
        {
          title: 'Auto Layout AI',
          desc: 'Sistem AI otomatis menata furniture dengan optimal berdasarkan dimensi dan zona ruangan.'
        },
        {
          title: 'Real-time Preview',
          desc: 'Lihat perubahan secara langsung dengan rendering real-time yang responsif.'
        },
        {
          title: 'Export & Share',
          desc: 'Simpan dan bagikan virtual tour Anda dengan mudah ke berbagai platform.'
        }
      ]
    },
    advantages: {
      label: 'KEUNGGULAN',
      mainTitle: 'Mengapa Memilih Kami?',
      items: [
        {
          title: 'AI-Powered',
          desc: 'Teknologi kecerdasan buatan untuk layout optimal dan efisien.'
        },
        {
          title: 'User Friendly',
          desc: 'Interface intuitif yang mudah digunakan bahkan untuk pemula.'
        },
        {
          title: 'High Performance',
          desc: 'Rendering cepat dan responsif untuk pengalaman terbaik.'
        },
        {
          title: 'Customizable',
          desc: 'Fleksibilitas penuh untuk menyesuaikan setiap aspek desain.'
        }
      ]
    },
    features: [
      { id: 1, icon: '🧭', title: 'Virtual Tour Interaktif', description: 'Navigasi ruangan 360° imersif' },
      { id: 2, icon: '🏠', title: 'AI Auto Layout', description: 'Penataan furniture otomatis berbasis AI' },
      { id: 3, icon: '⚡', title: 'Performa Cepat', description: 'Optimisasi performa untuk pengalaman ringan' },
    ],
    about: {
      hero: {
        label: 'Tentang Kami',
        title: 'CV. Virtualign Inova Cipta',
        description: 'Perusahaan pengembang teknologi visualisasi digital yang berfokus pada pembuatan Virtual Room Tour interaktif untuk berbagai industri — menghadirkan solusi digital yang inovatif, elegan, dan berdaya guna.'
      },
      profile: {
        label: 'Profil Perusahaan',
        title: 'Solusi Digital Inovatif untuk Masa Depan',
        description: 'CV. Virtualign Inova Cipta menyediakan solusi interaktif dan inovatif untuk properti, museum, gedung bersejarah, manufaktur, pameran, dan galeri seni. Selain itu, kami menghadirkan marketplace online untuk pemasaran karya seni, menghubungkan seniman, kolektor, dan pecinta seni di berbagai penjuru dunia.'
      },
      timeline: {
        label: 'Perjalanan Kami',
        title: 'Sejarah & Milestone',
        items: [
          { year: '2025', event: 'Pendirian perusahaan', desc: 'Memulai perjalanan inovasi digital' }
        ]
      },
      vision: {
        label: 'Visi Kami',
        title: 'Memimpin Inovasi Digital',
        text: 'Menjadi pemimpin dalam inovasi digital dengan menghadirkan pengalaman virtual tour yang imersif dan interaktif tanpa batas aksesibilitas.'
      },
      mission: {
        label: 'Misi Kami',
        title: 'Transformasi Digital',
        items: [
          'Mengembangkan teknologi Virtual Tour interaktif untuk berbagai sektor',
          'Mendukung pelestarian budaya dan sejarah melalui digitalisasi',
          'Meningkatkan pemasaran properti dan manufaktur dengan visualisasi digital',
          'Memfasilitasi pameran dan galeri seni virtual',
          'Menjadi marketplace seni terdepan',
          'Meningkatkan aksesibilitas dan inklusivitas',
          'Mendorong inovasi berkelanjutan dengan AR dan AI'
        ]
      },
      values: {
        label: 'Nilai Kami',
        title: 'Prinsip yang Kami Pegang',
        items: [
          { title: 'Inovasi', desc: 'Terus mengembangkan teknologi baru' },
          { title: 'Kreativitas', desc: 'Memadukan seni dan teknologi' },
          { title: 'Aksesibilitas', desc: 'Mudah diakses siapa saja' },
          { title: 'Kepercayaan & Transparansi', desc: 'Layanan dengan integritas' },
          { title: 'Kolaborasi', desc: 'Bersama seniman & industri kreatif' },
          { title: 'Keberlanjutan', desc: 'Mendukung pelestarian budaya dan sejarah' },
          { title: 'Kepuasan Pelanggan', desc: 'Layanan berkualitas dan mudah digunakan' }
        ]
      },
      philosophy: {
        title: 'Filosofi Perusahaan',
        quote: '"Membuka Gerbang ke Dunia Virtual, Menyatukan Kreativitas dan Teknologi"'
      },
      services: {
        label: 'Layanan Kami',
        title: 'Solusi Digital Terbaik',
        items: [
          { title: 'Virtual Tour Interaktif', desc: 'Pengalaman imersif untuk museum dan galeri' },
          { title: 'Galeri Virtual', desc: 'Platform pamer dan penjualan lukisan online' },
          { title: 'Real Estate VR', desc: 'Virtual tour untuk properti' },
          { title: 'Manajemen Aset', desc: 'Platform digital untuk aset perusahaan' },
          { title: 'Kustomisasi', desc: 'Solusi sesuai kebutuhan klien' }
        ]
      },
      advantages: {
        label: 'Keunggulan',
        title: 'Mengapa Memilih Kami?',
        description: 'Kami menawarkan kombinasi sempurna antara teknologi terdepan dan layanan profesional',
        items: [
          'Teknologi mutakhir (VR, 360°, AR, AI)',
          'Kualitas visual dan pengalaman interaktif terbaik',
          'Solusi inovatif meningkatkan daya tarik bisnis',
          'Tim profesional dan berpengalaman'
        ]
      },
      targetMarket: {
        label: 'Target Pasar',
        title: 'Klien Potensial Kami',
        items: [
          'Galeri seni dan kolektor lukisan',
          'Agen properti dan pengembang real estate',
          'Perusahaan dengan kebutuhan manajemen aset',
          'Museum, hotel, dan industri pariwisata',
          'Perusahaan yang ingin meningkatkan pengalaman digital'
        ]
      }
    },
    contact: {
      hero: {
        label: 'Hubungi Kami',
        title: 'Contact Us',
        subtitle: 'Hubungi kami untuk pertanyaan, saran, atau konsultasi project Anda'
      },
      info: {
        title: 'Get In Touch',
        description: 'Kami siap membantu Anda mewujudkan interior impian. Jangan ragu untuk menghubungi kami!'
      },
      address: {
        title: 'Address',
        content: 'Jl. Example Street No. 123\nJakarta, Indonesia 12345'
      },
      email: {
        title: 'Email',
        primary: 'info@virtualign.com',
        secondary: 'support@virtualign.com'
      },
      phone: {
        title: 'Phone',
        primary: '+62 812-3456-7890',
        secondary: '+62 812-3456-7891'
      },
      hours: {
        title: 'Working Hours',
        weekday: 'Senin - Jumat: 09:00 - 18:00',
        saturday: 'Sabtu: 09:00 - 15:00',
        sunday: 'Minggu: Tutup'
      },
      social: {
        title: 'Follow Us',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        youtube: 'https://youtube.com'
      },
      form: {
        title: 'Send Us a Message',
        subtitle: 'Isi form di bawah dan kami akan menghubungi Anda segera'
      },
      map: {
        title: 'Our Location',
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1944491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1234567890'
      }
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Temukan jawaban atas pertanyaan yang sering diajukan',
      questions: [
        {
          id: 1,
          question: 'Apa itu FurniLayout AI?',
          answer: 'FurniLayout AI adalah sistem berbasis kecerdasan buatan yang membantu Anda mengatur tata letak furniture secara otomatis dan optimal menggunakan teknologi machine learning.'
        },
        {
          id: 2,
          question: 'Bagaimana cara menggunakan aplikasi ini?',
          answer: 'Anda cukup memilih furniture yang ingin ditempatkan, kemudian sistem AI kami akan secara otomatis menempatkannya pada posisi terbaik di ruangan Anda berdasarkan dimensi dan layout yang optimal.'
        },
        {
          id: 3,
          question: 'Apakah aplikasi ini gratis?',
          answer: 'Ya, versi dasar aplikasi ini gratis untuk digunakan. Kami juga menyediakan versi premium dengan fitur-fitur tambahan untuk kebutuhan profesional.'
        },
        {
          id: 4,
          question: 'Jenis furniture apa saja yang didukung?',
          answer: 'Kami mendukung lebih dari 13 jenis furniture termasuk sofa, meja, kursi, lemari, tempat tidur, dan masih banyak lagi. Database kami terus berkembang untuk menambahkan lebih banyak pilihan.'
        },
        {
          id: 5,
          question: 'Bagaimana cara menghubungi tim support?',
          answer: 'Anda dapat menghubungi kami melalui email di info@furnilayout.ai atau telepon di +62 812-3456-7890. Tim kami siap membantu Anda.'
        }
      ]
    }
  });

  const [content, setContent] = useState(getDefaultContent());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch content from backend API
  const fetchContent = useCallback(async () => {
    try {
      const response = await api.get('/cms/content');
      
      if (response.data && response.data.content) {
        // Merge dengan default content (backend override default)
        const mergedContent = { ...getDefaultContent(), ...response.data.content };
        setContent(mergedContent);
        setError(null);
        console.log('✅ CMS content loaded from database');
      } else {
        console.warn('⚠️ Invalid backend response, using default content');
      }
    } catch (err) {
      console.warn('⚠️ CMS backend error, using default content:', err.message);
      setError(err.message);
      // Keep default content
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Update content via API
  const updateContent = async (section, newContent) => {
    try {
      const response = await api.put('/cms/content', {
        section,
        content: newContent
      });

      if (response.data && response.data.content) {
        setContent(response.data.content);
        return { success: true };
      }
      throw new Error('Failed to update content');
    } catch (err) {
      console.error('Error updating content:', err);
      return { success: false, error: err.message };
    }
  };

  // Update theme
  // eslint-disable-next-line no-unused-vars
  const updateTheme = async (themeData) => {
    try {
      const response = await api.put('/cms/theme', { theme: themeData });
      
      if (response.data && response.data.theme) {
        // Update theme in content
        setContent(prev => ({ ...prev, theme: response.data.theme }));
        return { success: true };
      }
      throw new Error('Failed to update theme');
    } catch (err) {
      console.error('Error updating theme:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <CMSContext.Provider
      value={{
        content,
        loading,
        error,
        updateContent,
        refreshContent: fetchContent,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export { CMSProvider };
