import React, { useState, useEffect, useContext } from 'react';
import { CMSContext } from '../contexts/CMSContext';
import '../styles/FAQ.css';

function FAQ() {
  const { content } = useContext(CMSContext);
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState({
    title: "Frequently Asked Questions",
    subtitle: "Temukan jawaban atas pertanyaan yang sering diajukan",
    questions: []
  });

  useEffect(() => {
    if (content && content.faq) {
      setFaqData(content.faq);
    }
  }, [content]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
