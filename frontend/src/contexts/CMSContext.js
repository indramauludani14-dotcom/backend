// src/contexts/CMSContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CMSContext = createContext();

function CMSProvider({ children }) {
  // langsung isi default agar halaman muncul
  const getDefaultContent = () => ({
    hero: {
      title: 'virtualign.id',
      subtitle: 'Virtual tour interaktif berbasis teknologi 3D',
      primary_button: 'Try Layout App',
      secondary_button: 'Virtual Tour',
    },
    features: [
      { id: 1, icon: '🧭', title: 'Virtual Tour Interaktif', description: 'Navigasi ruangan 360° imersif' },
      { id: 2, icon: '🏠', title: 'AI Auto Layout', description: 'Penataan furniture otomatis berbasis AI' },
      { id: 3, icon: '⚡', title: 'Performa Cepat', description: 'Optimisasi performa untuk pengalaman ringan' },
    ],
    about: {
      title: 'Tentang Virtualign',
      description:
        'Platform virtual tour berbasis AI yang membantu bisnis menampilkan ruang dan properti secara imersif.',
      stats: [
        { value: '100+', label: 'Klien Aktif' },
        { value: '50+', label: 'Proyek Virtual Tour' },
        { value: '99%', label: 'Kepuasan Pelanggan' },
      ],
    },
    contact: {
      email: 'info@virtualign.id',
      phone: '+62 812-3456-7890',
      location: 'Jakarta, Indonesia',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cms/content');
      if (!response.ok) throw new Error('Failed to fetch CMS content');

      const data = await response.json();
      if (data.status === 'success' && data.content) {
        // Merge backend content dengan default content
        // Backend data akan override default jika ada
        const mergedContent = { ...getDefaultContent(), ...data.content };
        setContent(mergedContent);
        setError(null);
      } else {
        // Backend response tidak valid, tetap gunakan default
        console.warn('⚠️ Invalid backend response, using default content');
      }
    } catch (err) {
      console.warn('⚠️ CMS backend tidak aktif, pakai default content');
      setError(err.message);
      // Jangan overwrite content, biarkan default tetap aktif
    } finally {
      setLoading(false);
    }
  }, []);

  // Coba ambil data backend tapi tanpa blokir tampilan
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateContent = async (section, newContent) => {
    try {
      const response = await fetch('http://localhost:5000/api/cms/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section, content: newContent }),
      });

      if (!response.ok) throw new Error('Failed to update content');
      const data = await response.json();
      if (data.status === 'success') {
        setContent(data.content);
        return { status: 'success' };
      }
      return { status: 'error', message: data.message || 'Update failed' };
    } catch (err) {
      console.error('Update Content Error:', err);
      return { status: 'error', message: err.message };
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
