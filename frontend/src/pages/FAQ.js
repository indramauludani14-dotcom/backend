import React, { useState, useEffect } from 'react';
import { cmsApi } from '../services/cmsApi';
import '../styles/FAQ.css';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faqData, setFaqData] = useState({
    title: "Frequently Asked Questions",
    subtitle: "Temukan jawaban atas pertanyaan yang sering diajukan",
    questions: []
  });

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await cmsApi.getFAQs();
        
        if (res.status === "success") {
          setFaqData(prev => ({
            ...prev,
            questions: res.faqs || []
          }));
        } else {
          setError(res.message || "Gagal memuat FAQ");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat FAQ");
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="faq-page">
        <div className="faq-loading">
          <div className="spinner"></div>
          <p>Memuat FAQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faq-page">
        <div className="faq-error">
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <div className="faq-hero">
        <div className="faq-hero-content">
          <span className="faq-label">FAQ</span>
          <h1 className="faq-title">{faqData.title}</h1>
          <p className="faq-subtitle">{faqData.subtitle}</p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="faq-container">
        <div className="faq-list">
          {faqData.questions && faqData.questions.length > 0 ? (
            faqData.questions.map((item, index) => (
              <div
                key={item.id || index}
                className={`faq-item ${openIndex === index ? 'active' : ''}`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3>{item.question}</h3>
                  <span className="faq-icon">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
                <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="faq-empty">
              <h3>Belum Ada Pertanyaan</h3>
              <p>FAQ masih dalam proses pengembangan. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="faq-contact-cta">
          <h2>Masih Punya Pertanyaan?</h2>
          <p>Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami!</p>
          <a href="/contact" className="contact-btn">
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
