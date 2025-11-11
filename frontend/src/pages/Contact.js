import React, { useState } from 'react';
import '../styles/Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    // Simulate API call (you can implement email sending in backend later)
    setTimeout(() => {
      alert('Thank you! Your message has been sent successfully. We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-content">
          <span className="contact-label">Hubungi Kami</span>
          <h1>Contact Us</h1>
          <p>Hubungi kami untuk pertanyaan, saran, atau konsultasi project Anda</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info">
            <div className="info-card">
              <h2>Get In Touch</h2>
              <p>Kami siap membantu Anda mewujudkan interior impian. Jangan ragu untuk menghubungi kami!</p>
            </div>

            <div className="info-item">
              <h3>Address</h3>
              <div className="info-content">
                <p>Jl. Example Street No. 123<br />Jakarta, Indonesia 12345</p>
              </div>
            </div>

            <div className="info-item">
              <h3>Email</h3>
              <div className="info-content">
                <p>
                  <a href="mailto:info@virtualign.com">info@virtualign.com</a><br />
                  <a href="mailto:support@virtualign.com">support@virtualign.com</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <h3>Phone</h3>
              <div className="info-content">
                <p>
                  <a href="tel:+6281234567890">+62 812-3456-7890</a><br />
                  <a href="tel:+6281234567891">+62 812-3456-7891</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <h3>Working Hours</h3>
              <div className="info-content">
                <p>
                  Senin - Jumat: 09:00 - 18:00<br />
                  Sabtu: 09:00 - 15:00<br />
                  Minggu: Tutup
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-buttons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                  Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                  Instagram
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                  Twitter
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                  LinkedIn
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn">
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h2>Send Us a Message</h2>
              <p className="form-subtitle">Isi form di bawah dan kami akan menghubungi Anda segera</p>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this about?"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your project or inquiry..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-submit-contact"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            </div>

            {/* Map placeholder */}
            <div className="map-card">
              <h3>Our Location</h3>
              <div className="map-placeholder">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1944491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
