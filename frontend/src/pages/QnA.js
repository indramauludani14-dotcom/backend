import React, { useState, useEffect } from 'react';
import { cmsApi } from '../services/cmsApi';
import '../styles/QnA.css';
import { NotificationManager } from '../components/Notification';

function QnA() {
  const [questions, setQuestions] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch answered questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const res = await cmsApi.getAnsweredQuestions();
    if (res.status === 'success') {
      setQuestions(res.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.question) {
      NotificationManager.warning(
        '⚠️ Form Tidak Lengkap',
        'Mohon isi semua field yang diperlukan'
      );
      return;
    }

    setSubmitting(true);
    const res = await cmsApi.submitQuestion(formData);
    
    if (res.status === 'success') {
      NotificationManager.success(
        '✅ Pertanyaan Terkirim!',
        res.message || 'Pertanyaan Anda akan dijawab oleh admin.',
        6000
      );
      setFormData({ name: '', email: '', question: '' });
      setShowForm(false);
    } else {
      NotificationManager.error(
        '❌ Gagal Mengirim',
        res.message || 'Terjadi kesalahan'
      );
    }
    setSubmitting(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter questions by search term
  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="qna-page">
      {/* Hero Section */}
      <div className="qna-hero">
        <div className="hero-content">
          <span className="qna-label">Q&A</span>
          <h1>Questions & Answers</h1>
          <p>Temukan jawaban atas pertanyaan Anda atau ajukan pertanyaan baru kepada tim kami</p>
        </div>
      </div>

      <div className="qna-container">
        {/* Search and Ask Section */}
        <div className="qna-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Cari pertanyaan berdasarkan kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <button 
            className={`btn-ask ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Batal' : 'Ajukan Pertanyaan'}
          </button>
        </div>

        {/* Question Form */}
        {showForm && (
          <div className="question-form-card">
            <div className="form-header">
              <div>
                <h3>Ajukan Pertanyaan Baru</h3>
                <p className="form-subtitle">Tim kami akan menjawab pertanyaan Anda sesegera mungkin</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="qna-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nama Lengkap</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Alamat Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="question">Pertanyaan Anda</label>
                <textarea
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Tuliskan pertanyaan Anda dengan detail..."
                  rows="6"
                  required
                ></textarea>
                <div className="char-count">{formData.question.length} karakter</div>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
              </button>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="questions-section">
          <div className="section-header">
            <div className="header-left">
              <h2>Pertanyaan yang Telah Dijawab</h2>
            </div>
            <div className="question-stats">
              <span className="stat-badge">{filteredQuestions.length}</span>
              <span className="stat-label">Pertanyaan</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat pertanyaan...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <h3>
                {searchTerm 
                  ? 'Tidak Ada Hasil' 
                  : 'Belum Ada Pertanyaan'}
              </h3>
              <p>
                {searchTerm 
                  ? `Tidak ada pertanyaan yang sesuai dengan "${searchTerm}"`
                  : 'Jadilah yang pertama mengajukan pertanyaan!'}
              </p>
              {searchTerm && (
                <button className="btn-clear-filter" onClick={() => setSearchTerm('')}>
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            <div className="questions-list">
              {filteredQuestions.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`question-item ${openIndex === index ? 'active' : ''}`}
                >
                  <button 
                    className="question-header"
                    onClick={() => toggleQuestion(index)}
                    aria-expanded={openIndex === index}
                  >
                    <div className="question-content">
                      <h4 className="question-title">{item.question}</h4>
                      <div className="question-meta">
                        <span className="meta-item">Oleh: {item.name}</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`toggle-icon ${openIndex === index ? 'open' : ''}`}>
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </button>

                  {openIndex === index && (
                    <div className="answer-content">
                      <div className="answer-header">
                        <span className="answer-label">Jawaban Tim Kami:</span>
                      </div>
                      <div className="answer-text">{item.answer}</div>
                      {item.answered_at && (
                        <div className="answer-footer">
                          Dijawab pada {new Date(item.answered_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QnA;
