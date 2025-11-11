import React, { useState, useContext, useEffect } from 'react';
import { CMSContext } from '../contexts/CMSContext';
import { cmsApi } from '../services/cmsApi';
import '../styles/Contact.css';
import { NotificationManager } from '../components/Notification';

function Contact() {
  const { content } = useContext(CMSContext);
  const contactData = content?.contact || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);

  // Load social media links from database
  useEffect(() => {
    loadSocialMedia();
  }, []);

  const loadSocialMedia = async () => {
    try {
      const response = await cmsApi.getActiveSocialMedia();
      if (response.status === 'success') {
        setSocialLinks(response.data || []);
      }
    } catch (error) {
      console.error('Error loading social media:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      NotificationManager.warning(
        '⚠️ Form Tidak Lengkap',
        'Mohon isi semua field yang wajib diisi (Name, Email, Message)'
      );
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await cmsApi.submitContact(formData);
      
      if (response.status === 'success') {
        NotificationManager.success(
          '✅ Pesan Terkirim!',
          'Terima kasih! Pesan Anda telah berhasil dikirim.\nKami akan menghubungi Anda segera.',
          6000
        );
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        NotificationManager.error(
          '❌ Gagal Mengirim',
          response.message || 'Terjadi kesalahan saat mengirim pesan'
        );
      }
    } catch (error) {
      NotificationManager.error(
        '❌ Error',
        'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
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
          <span className="contact-label">{contactData.hero?.label || 'Hubungi Kami'}</span>
          <h1>{contactData.hero?.title || 'Contact Us'}</h1>
          <p>{contactData.hero?.subtitle || 'Hubungi kami untuk pertanyaan, saran, atau konsultasi project Anda'}</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info">
            <div className="info-card">
              <h2>{contactData.info?.title || 'Get In Touch'}</h2>
              <p>{contactData.info?.description || 'Kami siap membantu Anda mewujudkan interior impian. Jangan ragu untuk menghubungi kami!'}</p>
            </div>

            <div className="info-item">
              <h3>{contactData.address?.title || 'Address'}</h3>
              <div className="info-content">
                <p style={{ whiteSpace: 'pre-line' }}>{contactData.address?.content || 'Jl. Example Street No. 123\nJakarta, Indonesia 12345'}</p>
              </div>
            </div>

            <div className="info-item">
              <h3>{contactData.email?.title || 'Email'}</h3>
              <div className="info-content">
                <p>
                  <a href={`mailto:${contactData.email?.primary || 'info@virtualign.com'}`}>
                    {contactData.email?.primary || 'info@virtualign.com'}
                  </a><br />
                  <a href={`mailto:${contactData.email?.secondary || 'support@virtualign.com'}`}>
                    {contactData.email?.secondary || 'support@virtualign.com'}
                  </a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <h3>{contactData.phone?.title || 'Phone'}</h3>
              <div className="info-content">
                <p>
                  <a href={`tel:${contactData.phone?.primary || '+6281234567890'}`}>
                    {contactData.phone?.primary || '+62 812-3456-7890'}
                  </a><br />
                  <a href={`tel:${contactData.phone?.secondary || '+6281234567891'}`}>
                    {contactData.phone?.secondary || '+62 812-3456-7891'}
                  </a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <h3>{contactData.hours?.title || 'Working Hours'}</h3>
              <div className="info-content">
                <p>
                  {contactData.hours?.weekday || 'Senin - Jumat: 09:00 - 18:00'}<br />
                  {contactData.hours?.saturday || 'Sabtu: 09:00 - 15:00'}<br />
                  {contactData.hours?.sunday || 'Minggu: Tutup'}
                </p>
              </div>
            </div>

            {/* Social Media - Dynamic from Database */}
            {socialLinks.length > 0 && (
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-buttons">
                  {socialLinks.map((social) => (
                    <a 
                      key={social.id}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-btn"
                      title={social.platform_name}
                    >
                      {social.icon && <i className={social.icon}></i>} {social.platform_name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h2>{contactData.form?.title || 'Send Us a Message'}</h2>
              <p className="form-subtitle">{contactData.form?.subtitle || 'Isi form di bawah dan kami akan menghubungi Anda segera'}</p>

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

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+62 812-3456-7890"
                    />
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
              <h3>{contactData.map?.title || 'Our Location'}</h3>
              <div className="map-placeholder">
                <iframe
                  src={contactData.map?.embedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1944491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sNational%20Monument!5e0!3m2!1sen!2sid!4v1234567890"}
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
