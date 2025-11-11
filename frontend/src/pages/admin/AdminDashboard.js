import React, { useState, useContext, useEffect } from 'react';
import { CMSContext } from '../../contexts/CMSContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { cmsApi } from '../../services/cmsApi';
import '../../styles/AdminDashboard.css';
import { NotificationManager } from '../../components/Notification';

function AdminDashboard() {
  const { content, refreshContent } = useContext(CMSContext);
  const { theme, refreshTheme } = useContext(ThemeContext);

  const [activeSection, setActiveSection] = useState('homepage');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editData, setEditData] = useState({});
  const [editTheme, setEditTheme] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEWS STATE
  const [newsList, setNewsList] = useState([]);
  const [newArticle, setNewArticle] = useState({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // FAQ STATE
  const [faqList, setFaqList] = useState([]);
  const [newFaq, setNewFaq] = useState({ category: 'Umum', question: '', answer: '', display_order: 0, is_active: 1 });
  const [editingFaq, setEditingFaq] = useState(null);

  // Q&A STATE
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answeredBy, setAnsweredBy] = useState('Admin');
  const [qnaFilter, setQnaFilter] = useState('all'); // all, pending, answered

  // CONTACT MESSAGES STATE
  const [contactMessages, setContactMessages] = useState([]);
  const [messageFilter, setMessageFilter] = useState('all'); // all, new, read

  // SOCIAL MEDIA STATE
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [newSocial, setNewSocial] = useState({ platform: '', platform_name: '', url: '', icon: '', display_order: 0, is_active: 1 });
  const [editingSocial, setEditingSocial] = useState(null);

  // HOUSE LAYOUTS STATE
  const [layoutsList, setLayoutsList] = useState([]);
  const [layoutsFilter, setLayoutsFilter] = useState('all'); // all, public, private

  // ACTIVITY LOGS STATE
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLimit, setLogsLimit] = useState(100);

  /* ===============================
     AUTH HANDLING
  =============================== */
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  /* ===============================
     NEWS HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'news') loadNews();
  }, [isAuthenticated, activeSection]);

  const loadNews = async () => {
    const res = await cmsApi.getNews();
    if (res.status === 'success') setNewsList(res.news);
  };

  /* ===============================
     FAQ HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'faq') loadFaqs();
  }, [isAuthenticated, activeSection]);

  const loadFaqs = async () => {
    const res = await cmsApi.getAllFAQs();
    if (res.status === 'success') setFaqList(res.faqs || []);
  };

  const handleCreateFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      NotificationManager.warning('⚠️ Incomplete', 'Question and answer are required');
      return;
    }

    const res = await cmsApi.createFAQ(newFaq);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'FAQ created successfully');
      setNewFaq({ category: 'Umum', question: '', answer: '', display_order: 0, is_active: 1 });
      loadFaqs();
    } else {
      NotificationManager.error('❌ Error', res.message || 'Failed to create FAQ');
    }
  };

  const handleUpdateFaq = async (id, data) => {
    const res = await cmsApi.updateFAQ(id, data);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'FAQ updated successfully');
      setEditingFaq(null);
      loadFaqs();
    } else {
      NotificationManager.error('❌ Error', res.message || 'Failed to update FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    const res = await cmsApi.deleteFAQ(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'FAQ deleted successfully');
      loadFaqs();
    } else {
      NotificationManager.error('❌ Error', res.message || 'Failed to delete FAQ');
    }
  };

  /* ===============================
     Q&A HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'qna') loadQuestions();
  }, [isAuthenticated, activeSection]);

  const loadQuestions = async () => {
    const res = await cmsApi.getAllQuestions();
    if (res.status === 'success') {
      setQuestionsList(res.data || []);
    }
  };

  const handleAnswerQuestion = async (question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
    setAnsweredBy(question.answered_by || 'Admin');
  };

  const submitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      NotificationManager.warning('⚠️ Incomplete', 'Please provide an answer');
      return;
    }

    const res = await cmsApi.answerQuestion(selectedQuestion.id, {
      answer: answerText,
      answered_by: answeredBy
    });

    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Question answered successfully');
      setSelectedQuestion(null);
      setAnswerText('');
      loadQuestions();
    } else {
      NotificationManager.error('❌ Error', res.message || 'Failed to answer question');
    }
  };

  const deleteQuestion = async (id) => {
    NotificationManager.confirm(
      '⚠️ Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus pertanyaan ini?',
      async () => {
        const res = await cmsApi.deleteQuestion(id);
        if (res.status === 'success') {
          NotificationManager.success('✅ Success', 'Question deleted successfully');
          loadQuestions();
        } else {
          NotificationManager.error('❌ Error', res.message || 'Failed to delete question');
        }
      },
      null,
      'Hapus',
      'Batal'
    );
  };

  const filteredQuestions = qnaFilter === 'all' 
    ? questionsList 
    : questionsList.filter(q => q.status === qnaFilter);

  /* ===============================
     CONTACT MESSAGES HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'contact') loadContactMessages();
  }, [isAuthenticated, activeSection]);

  const loadContactMessages = async () => {
    const res = await cmsApi.getContactMessages();
    if (res.status === 'success') setContactMessages(res.data || []);
  };

  const handleMarkAsRead = async (id) => {
    const res = await cmsApi.markMessageRead(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Message marked as read');
      loadContactMessages();
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    const res = await cmsApi.deleteContactMessage(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Message deleted');
      loadContactMessages();
    }
  };

  const filteredMessages = messageFilter === 'all'
    ? contactMessages
    : contactMessages.filter(m => m.status === messageFilter);

  /* ===============================
     SOCIAL MEDIA HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'social') loadSocialMedia();
  }, [isAuthenticated, activeSection]);

  const loadSocialMedia = async () => {
    const res = await cmsApi.getSocialMedia();
    if (res.status === 'success') setSocialMediaList(res.data || []);
  };

  const handleCreateSocial = async () => {
    if (!newSocial.platform || !newSocial.url) {
      NotificationManager.warning('⚠️ Incomplete', 'Platform and URL are required');
      return;
    }

    const res = await cmsApi.createSocialMedia(newSocial);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Social media link created');
      setNewSocial({ platform: '', platform_name: '', url: '', icon: '', display_order: 0, is_active: 1 });
      loadSocialMedia();
    }
  };

  const handleUpdateSocial = async (id, data) => {
    const res = await cmsApi.updateSocialMedia(id, data);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Social media link updated');
      setEditingSocial(null);
      loadSocialMedia();
    }
  };

  const handleDeleteSocial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social media link?')) return;
    const res = await cmsApi.deleteSocialMedia(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Social media link deleted');
      loadSocialMedia();
    }
  };

  /* ===============================
     HOUSE LAYOUTS HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'layouts') loadLayouts();
  }, [isAuthenticated, activeSection]);

  const loadLayouts = async () => {
    const res = await cmsApi.getAllLayouts();
    if (res.status === 'success') setLayoutsList(res.data || []);
  };

  const handleToggleLayoutPublic = async (id) => {
    const res = await cmsApi.toggleLayoutPublic(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Layout visibility toggled');
      loadLayouts();
    }
  };

  const handleDeleteLayout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this layout?')) return;
    const res = await cmsApi.deleteLayout(id);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', 'Layout deleted');
      loadLayouts();
    }
  };

  /* ===============================
     ACTIVITY LOGS HANDLING
  =============================== */
  useEffect(() => {
    if (isAuthenticated && activeSection === 'activity') loadActivityLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeSection, logsLimit]);

  const loadActivityLogs = async () => {
    const res = await cmsApi.getAllActivityLogs(logsLimit);
    if (res.status === 'success') setActivityLogs(res.data || []);
  };

  const handleCleanupLogs = async (days) => {
    if (!window.confirm(`Delete all activity logs older than ${days} days?`)) return;
    const res = await cmsApi.cleanupOldLogs(days);
    if (res.status === 'success') {
      NotificationManager.success('✅ Success', res.message);
      loadActivityLogs();
    }
  };

  /* ===============================
     IMAGE UPLOAD HANDLER
  =============================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      NotificationManager.error('❌ Error', 'File terlalu besar! Maksimal 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      NotificationManager.error('❌ Error', 'Format file tidak valid! Gunakan PNG, JPG, GIF, atau WebP');
      return;
    }

    setUploadingImage(true);
    NotificationManager.info('📤 Uploading', 'Mengupload gambar...');

    const res = await cmsApi.uploadNewsImage(file);
    if (res.status === 'success') {
      setNewArticle({ ...newArticle, image: res.image_url });
      NotificationManager.success('✅ Success', 'Gambar berhasil diupload!');
    } else {
      NotificationManager.error('❌ Error', res.message || 'Gagal upload gambar');
    }
    setUploadingImage(false);
  };

  /* ===============================
     LOGIN HANDLER
  =============================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await cmsApi.login(loginForm.username, loginForm.password);
      if (result.status === 'success') {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAuthenticated', 'true');
        setMessage({ text: 'Login successful!', type: 'success' });
        refreshContent();
        refreshTheme();
      } else {
        setMessage({ text: result.message || 'Invalid credentials', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error connecting to server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOGOUT HANDLER
  =============================== */
  const handleLogout = async () => {
    await cmsApi.logout();
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setMessage({ text: 'Logged out successfully', type: 'success' });
  };

  /* ===============================
     SAVE HANDLER
  =============================== */
  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let result;

      if (activeSection === 'theme') {
        const themeToSave = editTheme || theme || {};
        result = await cmsApi.updateTheme(themeToSave);
        if (result.status === 'success') await refreshTheme();
      } else if (activeSection === 'homepage') {
        // Save all home page sections
        const sectionsToSave = ['hero', 'virtualTour', 'services', 'advantages'];
        let allSuccess = true;
        
        for (const section of sectionsToSave) {
          const dataToSave = editData[section] || content[section] || {};
          const res = await cmsApi.updateContent(section, dataToSave);
          if (res.status !== 'success') {
            allSuccess = false;
            break;
          }
        }
        
        if (allSuccess) {
          await refreshContent();
          result = { status: 'success' };
        } else {
          result = { status: 'error' };
        }
      } else {
        const dataToSave = editData[activeSection] || content[activeSection] || {};
        result = await cmsApi.updateContent(activeSection, dataToSave);
        if (result.status === 'success') await refreshContent();
      }

      setMessage({
        text: result.status === 'success'
          ? 'Changes saved successfully!'
          : 'Failed to save changes',
        type: result.status === 'success' ? 'success' : 'error',
      });

      if (result.status === 'success') {
        setEditData({});
        setEditTheme(null);
      }
    } catch (error) {
      setMessage({ text: 'Error saving changes: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INPUT HANDLER
  =============================== */
  // eslint-disable-next-line no-unused-vars
  const handleInputChange = (path, value) => {
    const newData = { ...editData };
    if (!newData[activeSection]) {
      const sectionContent = content[activeSection] || {};
      newData[activeSection] = JSON.parse(JSON.stringify(sectionContent));
    }
    const keys = path.split('.');
    let current = newData[activeSection];
    for (let i = 0; i < keys.length - 1; i++) {
      if (Array.isArray(current)) current = current[parseInt(keys[i])];
      else current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditData(newData);
  };

  /* ===============================
     LOGIN PAGE
  =============================== */
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                id="admin-username"
                name="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                disabled={loading}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loading}
                required
                placeholder="Enter password"
              />
            </div>
            <button 
              id="admin-login-button"
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="login-hint">
            <small>Default credentials: admin / admin123</small>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     DASHBOARD MAIN VIEW
  =============================== */
  if (!content || !theme) {
    return <div className="loading-page">Loading dashboard...</div>;
  }

  const currentContent = editData[activeSection] || content[activeSection] || {};
  const currentTheme = editTheme || theme || {};

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>CMS Dashboard</h2>
        <ul className="section-list">
          {[
            { key: 'homepage', label: 'Home Page Content' },
            { key: 'about', label: 'About Page' },
            { key: 'contact', label: 'Contact Page' },
            { key: 'faq', label: 'FAQ Management' },
            { key: 'qna', label: 'Q&A Management' },
            { key: 'messages', label: 'Contact Messages' },
            { key: 'news', label: 'News Management' },
            { key: 'social', label: 'Social Media Links' },
            { key: 'layouts', label: 'House Layouts' },
            { key: 'activity', label: 'Activity Logs' },
            { key: 'theme', label: 'Theme Editor' },
          ].map(({ key, label }) => (
            <li
              key={key}
              className={activeSection === key ? 'active' : ''}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </aside>

      {/* CONTENT AREA */}
      <main className="admin-content">
        <div className="content-header">
          <h1>Edit {activeSection === 'homepage' ? 'Home Page Content' : activeSection}</h1>
          {activeSection !== 'news' && activeSection !== 'qna' && activeSection !== 'faq' && activeSection !== 'messages' && activeSection !== 'social' && activeSection !== 'layouts' && activeSection !== 'activity' && (
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        {/* ================= HOME PAGE CONTENT (COMBINED) ================= */}
        {activeSection === 'homepage' && (
          <>
            {/* HERO SECTION */}
            <section className="admin-section">
              <h2>Hero Section</h2>
              {content.hero && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={(editData.hero || content.hero).title || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.hero) {
                          newData.hero = { ...content.hero };
                        }
                        newData.hero.title = e.target.value;
                        setEditData(newData);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <textarea
                      value={(editData.hero || content.hero).subtitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.hero) {
                          newData.hero = { ...content.hero };
                        }
                        newData.hero.subtitle = e.target.value;
                        setEditData(newData);
                      }}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </section>

            {/* VIRTUAL TOUR SECTION */}
            <section className="admin-section">
              <h2>Virtual Tour Section</h2>
              {content.virtualTour && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={(editData.virtualTour || content.virtualTour).title || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.virtualTour) {
                          newData.virtualTour = { ...content.virtualTour };
                        }
                        newData.virtualTour.title = e.target.value;
                        setEditData(newData);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={(editData.virtualTour || content.virtualTour).description || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.virtualTour) {
                          newData.virtualTour = { ...content.virtualTour };
                        }
                        newData.virtualTour.description = e.target.value;
                        setEditData(newData);
                      }}
                      rows={5}
                    />
                  </div>
                </>
              )}
            </section>

            {/* SERVICES SECTION */}
            <section className="admin-section">
              <h2>Services Section</h2>
              {(content.services || editData.services) ? (
                <>
                  <div className="form-group">
                    <label>Main Title</label>
                    <input
                      type="text"
                      value={(editData.services || content.services)?.mainTitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.services) {
                          newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                        }
                        newData.services.mainTitle = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="Kebebasan untuk Membuat Virtual Tour yang Anda Inginkan"
                    />
                  </div>
                  <h3>Service Items</h3>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Edit the 4 service features displayed on the homepage
                  </p>
                  {(editData.services?.items || content.services?.items || []).map((item, index) => (
                    <div key={index} className="service-item-editor" style={{ 
                      background: '#1a1a1a', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Service {index + 1}</h4>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.services) {
                              newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.services.items || [])];
                            newItems[index] = { ...newItems[index], title: e.target.value };
                            newData.services.items = newItems;
                            setEditData(newData);
                          }}
                          placeholder={`Service ${index + 1} title`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={item.desc || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.services) {
                              newData.services = JSON.parse(JSON.stringify(content.services || { mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.services.items || [])];
                            newItems[index] = { ...newItems[index], desc: e.target.value };
                            newData.services.items = newItems;
                            setEditData(newData);
                          }}
                          rows={4}
                          placeholder={`Service ${index + 1} description`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#999' }}>Loading services section...</p>
                </div>
              )}
            </section>

            {/* ADVANTAGES SECTION */}
            <section className="admin-section">
              <h2>Advantages Section</h2>
              {(content.advantages || editData.advantages) ? (
                <>
                  <div className="form-group">
                    <label>Label (Small Text Above Title)</label>
                    <input
                      type="text"
                      value={(editData.advantages || content.advantages)?.label || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.advantages) {
                          newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                        }
                        newData.advantages.label = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="KEUNGGULAN"
                    />
                  </div>
                  <div className="form-group">
                    <label>Main Title</label>
                    <input
                      type="text"
                      value={(editData.advantages || content.advantages)?.mainTitle || ''}
                      onChange={(e) => {
                        const newData = { ...editData };
                        if (!newData.advantages) {
                          newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                        }
                        newData.advantages.mainTitle = e.target.value;
                        setEditData(newData);
                      }}
                      placeholder="Mengapa Memilih Kami?"
                    />
                  </div>
                  <h3>Advantage Items</h3>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Edit the 4 key advantages displayed on the homepage
                  </p>
                  {(editData.advantages?.items || content.advantages?.items || []).map((item, index) => (
                    <div key={index} className="advantage-item-editor" style={{ 
                      background: '#1a1a1a', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      marginBottom: '1rem',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Advantage {index + 1}</h4>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.advantages) {
                              newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.advantages.items || [])];
                            newItems[index] = { ...newItems[index], title: e.target.value };
                            newData.advantages.items = newItems;
                            setEditData(newData);
                          }}
                          placeholder={`Advantage ${index + 1} title`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={item.desc || ''}
                          onChange={(e) => {
                            const newData = { ...editData };
                            if (!newData.advantages) {
                              newData.advantages = JSON.parse(JSON.stringify(content.advantages || { label: '', mainTitle: '', items: [] }));
                            }
                            const newItems = [...(newData.advantages.items || [])];
                            newItems[index] = { ...newItems[index], desc: e.target.value };
                            newData.advantages.items = newItems;
                            setEditData(newData);
                          }}
                          rows={4}
                          placeholder={`Advantage ${index + 1} description`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#999' }}>Loading advantages section...</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* ================= ABOUT PAGE ================= */}
        {activeSection === 'about' && currentContent && (
          <>
            {/* HERO SECTION */}
            <section className="admin-section">
              <h2>Hero Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.hero?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.hero) newData.about.hero = {};
                    newData.about.hero.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Tentang Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.hero?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.hero) newData.about.hero = {};
                    newData.about.hero.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="CV. Virtualign Inova Cipta"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={currentContent.hero?.description || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.hero) newData.about.hero = {};
                    newData.about.hero.description = e.target.value;
                    setEditData(newData);
                  }}
                  rows={4}
                  placeholder="Perusahaan pengembang teknologi visualisasi digital..."
                />
              </div>
            </section>

            {/* PROFILE SECTION */}
            <section className="admin-section">
              <h2>Profile Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.profile?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.profile) newData.about.profile = {};
                    newData.about.profile.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Profil Perusahaan"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.profile?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.profile) newData.about.profile = {};
                    newData.about.profile.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Solusi Digital Inovatif untuk Masa Depan"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={currentContent.profile?.description || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.profile) newData.about.profile = {};
                    newData.about.profile.description = e.target.value;
                    setEditData(newData);
                  }}
                  rows={4}
                  placeholder="CV. Virtualign Inova Cipta menyediakan solusi..."
                />
              </div>
            </section>

            {/* VISION SECTION */}
            <section className="admin-section">
              <h2>Vision Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.vision?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.vision) newData.about.vision = {};
                    newData.about.vision.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Visi Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.vision?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.vision) newData.about.vision = {};
                    newData.about.vision.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Memimpin Inovasi Digital"
                />
              </div>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={currentContent.vision?.text || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.vision) newData.about.vision = {};
                    newData.about.vision.text = e.target.value;
                    setEditData(newData);
                  }}
                  rows={3}
                  placeholder="Menjadi pemimpin dalam inovasi digital..."
                />
              </div>
            </section>

            {/* MISSION SECTION */}
            <section className="admin-section">
              <h2>Mission Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.mission?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.mission) newData.about.mission = {};
                    newData.about.mission.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Misi Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.mission?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.mission) newData.about.mission = {};
                    newData.about.mission.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Transformasi Digital"
                />
              </div>
              <div className="form-group">
                <label>Mission Items (One per line)</label>
                <textarea
                  value={currentContent.mission?.items?.join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.mission) newData.about.mission = {};
                    newData.about.mission.items = e.target.value.split('\n').filter(item => item.trim());
                    setEditData(newData);
                  }}
                  rows={8}
                  placeholder="Mengembangkan teknologi Virtual Tour...&#10;Mendukung pelestarian budaya..."
                />
              </div>
            </section>

            {/* PHILOSOPHY SECTION */}
            <section className="admin-section">
              <h2>Philosophy Section</h2>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.philosophy?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.philosophy) newData.about.philosophy = {};
                    newData.about.philosophy.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Filosofi Perusahaan"
                />
              </div>
              <div className="form-group">
                <label>Quote</label>
                <textarea
                  value={currentContent.philosophy?.quote || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.philosophy) newData.about.philosophy = {};
                    newData.about.philosophy.quote = e.target.value;
                    setEditData(newData);
                  }}
                  rows={3}
                  placeholder='"Membuka Gerbang ke Dunia Virtual..."'
                />
              </div>
            </section>

            {/* TIMELINE SECTION */}
            <section className="admin-section">
              <h2>Timeline Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.timeline?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.timeline) newData.about.timeline = {};
                    newData.about.timeline.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Perjalanan Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.timeline?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.timeline) newData.about.timeline = {};
                    newData.about.timeline.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Sejarah & Milestone"
                />
              </div>
              <div className="form-group">
                <label>Timeline Items (Format: YEAR|Event|Description, one per line)</label>
                <textarea
                  value={currentContent.timeline?.items?.map(item => `${item.year}|${item.event}|${item.desc}`).join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.timeline) newData.about.timeline = {};
                    newData.about.timeline.items = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const [year, event, desc] = line.split('|');
                      return { year: year?.trim() || '', event: event?.trim() || '', desc: desc?.trim() || '' };
                    });
                    setEditData(newData);
                  }}
                  rows={5}
                  placeholder="2025|Pendirian perusahaan|Memulai perjalanan inovasi digital"
                />
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Format: Tahun|Nama Event|Deskripsi (pisahkan dengan |)
                </small>
              </div>
            </section>

            {/* VALUES SECTION */}
            <section className="admin-section">
              <h2>Values Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.values?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.values) newData.about.values = {};
                    newData.about.values.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Nilai Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.values?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.values) newData.about.values = {};
                    newData.about.values.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Prinsip yang Kami Pegang"
                />
              </div>
              <div className="form-group">
                <label>Value Items (Format: Title|Description, one per line)</label>
                <textarea
                  value={currentContent.values?.items?.map(item => `${item.title}|${item.desc}`).join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.values) newData.about.values = {};
                    newData.about.values.items = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const [title, desc] = line.split('|');
                      return { title: title?.trim() || '', desc: desc?.trim() || '' };
                    });
                    setEditData(newData);
                  }}
                  rows={8}
                  placeholder="Inovasi|Terus mengembangkan teknologi baru&#10;Kreativitas|Memadukan seni dan teknologi"
                />
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Format: Judul Nilai|Deskripsi (pisahkan dengan |)
                </small>
              </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="admin-section">
              <h2>Services Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.services?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.services) newData.about.services = {};
                    newData.about.services.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Layanan Kami"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.services?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.services) newData.about.services = {};
                    newData.about.services.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Solusi Digital Terbaik"
                />
              </div>
              <div className="form-group">
                <label>Service Items (Format: Title|Description, one per line)</label>
                <textarea
                  value={currentContent.services?.items?.map(item => `${item.title}|${item.desc}`).join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.services) newData.about.services = {};
                    newData.about.services.items = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                      const [title, desc] = line.split('|');
                      return { title: title?.trim() || '', desc: desc?.trim() || '' };
                    });
                    setEditData(newData);
                  }}
                  rows={6}
                  placeholder="Virtual Tour Interaktif|Pengalaman imersif untuk museum dan galeri&#10;Galeri Virtual|Platform pamer dan penjualan lukisan online"
                />
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Format: Nama Layanan|Deskripsi (pisahkan dengan |)
                </small>
              </div>
            </section>

            {/* ADVANTAGES SECTION */}
            <section className="admin-section">
              <h2>Advantages Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.advantages?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.advantages) newData.about.advantages = {};
                    newData.about.advantages.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Keunggulan"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.advantages?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.advantages) newData.about.advantages = {};
                    newData.about.advantages.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Mengapa Memilih Kami?"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={currentContent.advantages?.description || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.advantages) newData.about.advantages = {};
                    newData.about.advantages.description = e.target.value;
                    setEditData(newData);
                  }}
                  rows={2}
                  placeholder="Kami menawarkan kombinasi sempurna antara teknologi terdepan dan layanan profesional"
                />
              </div>
              <div className="form-group">
                <label>Advantage Items (One per line)</label>
                <textarea
                  value={currentContent.advantages?.items?.join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.advantages) newData.about.advantages = {};
                    newData.about.advantages.items = e.target.value.split('\n').filter(item => item.trim());
                    setEditData(newData);
                  }}
                  rows={5}
                  placeholder="Teknologi mutakhir (VR, 360°, AR, AI)&#10;Kualitas visual dan pengalaman interaktif terbaik"
                />
              </div>
            </section>

            {/* TARGET MARKET SECTION */}
            <section className="admin-section">
              <h2>Target Market Section</h2>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={currentContent.targetMarket?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.targetMarket) newData.about.targetMarket = {};
                    newData.about.targetMarket.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Target Pasar"
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.targetMarket?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.targetMarket) newData.about.targetMarket = {};
                    newData.about.targetMarket.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Klien Potensial Kami"
                />
              </div>
              <div className="form-group">
                <label>Target Market Items (One per line)</label>
                <textarea
                  value={currentContent.targetMarket?.items?.join('\n') || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.about) newData.about = JSON.parse(JSON.stringify(content.about));
                    if (!newData.about.targetMarket) newData.about.targetMarket = {};
                    newData.about.targetMarket.items = e.target.value.split('\n').filter(item => item.trim());
                    setEditData(newData);
                  }}
                  rows={6}
                  placeholder="Galeri seni dan kolektor lukisan&#10;Agen properti dan pengembang real estate"
                />
              </div>
            </section>
          </>
        )}

        {/* ================= CONTACT PAGE ================= */}
        {activeSection === 'contact' && currentContent && (
          <>
            {/* INFO BOX */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '1rem' }}>ℹ️ Contact Page Information</h3>
              <p style={{ margin: '0.5rem 0', color: '#999', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <strong>Note:</strong> This section manages the display text and static information on the Contact page.
              </p>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#999', fontSize: '0.9rem', lineHeight: '1.8' }}>
                <li><strong>Social Media Links</strong> → Managed in "Social Media Links" section (below)</li>
                <li><strong>Contact Messages</strong> → View submissions in "Contact Messages" section (below)</li>
              </ul>
            </div>

            {/* HERO SECTION */}
            <section className="admin-section">
              <h2>Hero Section</h2>
              <div className="form-group">
                <label>Label (Small Text)</label>
                <input
                  type="text"
                  value={currentContent.hero?.label || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hero) newData.contact.hero = {};
                    newData.contact.hero.label = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Hubungi Kami"
                />
              </div>
              <div className="form-group">
                <label>Main Title</label>
                <input
                  type="text"
                  value={currentContent.hero?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hero) newData.contact.hero = {};
                    newData.contact.hero.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Contact Us"
                />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <textarea
                  value={currentContent.hero?.subtitle || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hero) newData.contact.hero = {};
                    newData.contact.hero.subtitle = e.target.value;
                    setEditData(newData);
                  }}
                  rows={2}
                  placeholder="Hubungi kami untuk pertanyaan..."
                />
              </div>
            </section>

            {/* GET IN TOUCH SECTION */}
            <section className="admin-section">
              <h2>Get In Touch Info</h2>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={currentContent.info?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.info) newData.contact.info = {};
                    newData.contact.info.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Get In Touch"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={currentContent.info?.description || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.info) newData.contact.info = {};
                    newData.contact.info.description = e.target.value;
                    setEditData(newData);
                  }}
                  rows={3}
                  placeholder="Kami siap membantu..."
                />
              </div>
            </section>

            {/* ADDRESS SECTION */}
            <section className="admin-section">
              <h2>Address Information</h2>
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={currentContent.address?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.address) newData.contact.address = {};
                    newData.contact.address.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Address"
                />
              </div>
              <div className="form-group">
                <label>Address Content (Use \n for new line)</label>
                <textarea
                  value={currentContent.address?.content || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.address) newData.contact.address = {};
                    newData.contact.address.content = e.target.value;
                    setEditData(newData);
                  }}
                  rows={3}
                  placeholder="Jl. Example Street No. 123&#10;Jakarta, Indonesia 12345"
                />
              </div>
            </section>

            {/* EMAIL SECTION */}
            <section className="admin-section">
              <h2>Email Information</h2>
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={currentContent.email?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.email) newData.contact.email = {};
                    newData.contact.email.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Email"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Email</label>
                  <input
                    type="email"
                    value={currentContent.email?.primary || ''}
                    onChange={(e) => {
                      const newData = { ...editData };
                      if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                      if (!newData.contact.email) newData.contact.email = {};
                      newData.contact.email.primary = e.target.value;
                      setEditData(newData);
                    }}
                    placeholder="info@virtualign.com"
                  />
                </div>
                <div className="form-group">
                  <label>Secondary Email</label>
                  <input
                    type="email"
                    value={currentContent.email?.secondary || ''}
                    onChange={(e) => {
                      const newData = { ...editData };
                      if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                      if (!newData.contact.email) newData.contact.email = {};
                      newData.contact.email.secondary = e.target.value;
                      setEditData(newData);
                    }}
                    placeholder="support@virtualign.com"
                  />
                </div>
              </div>
            </section>

            {/* PHONE SECTION */}
            <section className="admin-section">
              <h2>Phone Information</h2>
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={currentContent.phone?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.phone) newData.contact.phone = {};
                    newData.contact.phone.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Phone"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Phone</label>
                  <input
                    type="tel"
                    value={currentContent.phone?.primary || ''}
                    onChange={(e) => {
                      const newData = { ...editData };
                      if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                      if (!newData.contact.phone) newData.contact.phone = {};
                      newData.contact.phone.primary = e.target.value;
                      setEditData(newData);
                    }}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
                <div className="form-group">
                  <label>Secondary Phone</label>
                  <input
                    type="tel"
                    value={currentContent.phone?.secondary || ''}
                    onChange={(e) => {
                      const newData = { ...editData };
                      if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                      if (!newData.contact.phone) newData.contact.phone = {};
                      newData.contact.phone.secondary = e.target.value;
                      setEditData(newData);
                    }}
                    placeholder="+62 812-3456-7891"
                  />
                </div>
              </div>
            </section>

            {/* WORKING HOURS SECTION */}
            <section className="admin-section">
              <h2>Working Hours</h2>
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={currentContent.hours?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hours) newData.contact.hours = {};
                    newData.contact.hours.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Working Hours"
                />
              </div>
              <div className="form-group">
                <label>Weekday Hours</label>
                <input
                  type="text"
                  value={currentContent.hours?.weekday || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hours) newData.contact.hours = {};
                    newData.contact.hours.weekday = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Senin - Jumat: 09:00 - 18:00"
                />
              </div>
              <div className="form-group">
                <label>Saturday Hours</label>
                <input
                  type="text"
                  value={currentContent.hours?.saturday || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hours) newData.contact.hours = {};
                    newData.contact.hours.saturday = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Sabtu: 09:00 - 15:00"
                />
              </div>
              <div className="form-group">
                <label>Sunday Status</label>
                <input
                  type="text"
                  value={currentContent.hours?.sunday || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.hours) newData.contact.hours = {};
                    newData.contact.hours.sunday = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Minggu: Tutup"
                />
              </div>
            </section>

            {/* SOCIAL MEDIA - NOW MANAGED SEPARATELY */}
            <div style={{
              background: 'rgba(100,180,255,0.1)',
              border: '1px solid rgba(100,180,255,0.3)',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#64b4ff', fontSize: '1rem' }}>
                🔗 Social Media Links
              </h3>
              <p style={{ margin: '0', color: '#aaa', fontSize: '0.9rem' }}>
                Social media links are now managed in a dedicated section below. 
                Go to <strong style={{ color: '#fff' }}>"Social Media Links"</strong> in the menu to add, edit, or delete social media platforms.
              </p>
            </div>

            {/* CONTACT FORM SECTION */}
            <section className="admin-section">
              <h2>Contact Form Text</h2>
              <div className="form-group">
                <label>Form Title</label>
                <input
                  type="text"
                  value={currentContent.form?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.form) newData.contact.form = {};
                    newData.contact.form.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Send Us a Message"
                />
              </div>
              <div className="form-group">
                <label>Form Subtitle</label>
                <textarea
                  value={currentContent.form?.subtitle || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.form) newData.contact.form = {};
                    newData.contact.form.subtitle = e.target.value;
                    setEditData(newData);
                  }}
                  rows={2}
                  placeholder="Isi form di bawah..."
                />
              </div>
            </section>

            {/* MAP SECTION */}
            <section className="admin-section">
              <h2>Google Maps Embed</h2>
              <div className="form-group">
                <label>Map Section Title</label>
                <input
                  type="text"
                  value={currentContent.map?.title || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.map) newData.contact.map = {};
                    newData.contact.map.title = e.target.value;
                    setEditData(newData);
                  }}
                  placeholder="Our Location"
                />
              </div>
              <div className="form-group">
                <label>Google Maps Embed URL</label>
                <textarea
                  value={currentContent.map?.embedUrl || ''}
                  onChange={(e) => {
                    const newData = { ...editData };
                    if (!newData.contact) newData.contact = JSON.parse(JSON.stringify(content.contact));
                    if (!newData.contact.map) newData.contact.map = {};
                    newData.contact.map.embedUrl = e.target.value;
                    setEditData(newData);
                  }}
                  rows={3}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <small style={{ color: '#999', display: 'block', marginTop: '0.5rem' }}>
                  Get embed URL from Google Maps → Share → Embed a map → Copy HTML (only the src URL)
                </small>
              </div>
            </section>
          </>
        )}

        {/* ================= FAQ SECTION ================= */}
        {/* FAQ dikelola melalui FAQ Management, bukan CMS content */}
        
        {/* ================= NEWS SECTION ================= */}
        {activeSection === 'news' && (
          <section className="news-editor">
            <h2>Manage News</h2>

            {/* FORM TAMBAH */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="teknologi">Teknologi</option>
                <option value="bisnis">Bisnis</option>
                <option value="tutorial">Tutorial</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={newArticle.author}
                onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Excerpt</label>
              <input
                type="text"
                value={newArticle.excerpt}
                onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                placeholder="Ringkasan singkat berita..."
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                rows={6}
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="Konten lengkap berita..."
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <small className="upload-status">Uploading...</small>}
              {newArticle.image && (
                <div className="image-preview">
                  <img src={newArticle.image} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => setNewArticle({ ...newArticle, image: '' })}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={async () => {
                if (!newArticle.title) {
                  NotificationManager.warning('⚠️ Incomplete', 'Title wajib diisi!');
                  return;
                }
                const res = await cmsApi.createNews(newArticle);
                if (res.status === 'success') {
                  NotificationManager.success('✅ Success', 'News created successfully');
                  setNewArticle({ title: '', excerpt: '', content: '', image: '', category: 'General', author: 'Admin' });
                  loadNews();
                } else {
                  NotificationManager.error('❌ Error', res.message || 'Failed to create news');
                }
              }}
              disabled={uploadingImage}
            >
              Add News
            </button>

            {/* LIST BERITA */}
            <h3>Existing News</h3>
            <ul className="news-list">
              {newsList.map((n) => (
                <li key={n.id} className="news-item">
                  <strong>{n.title}</strong> — {n.excerpt}
                  <div className="news-actions">
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        const res = await cmsApi.updateNews(n.id, {
                          ...n,
                          title: `${n.title} (Edited)`,
                        });
                        if (res.status === 'success') {
                          NotificationManager.success('✅ Success', 'News updated successfully');
                          loadNews();
                        } else {
                          NotificationManager.error('❌ Error', res.message || 'Failed to update news');
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this news?')) return;
                        const res = await cmsApi.deleteNews(n.id);
                        if (res.status === 'success') {
                          NotificationManager.success('✅ Success', 'News deleted successfully');
                          loadNews();
                        } else {
                          NotificationManager.error('❌ Error', res.message || 'Failed to delete news');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ==================== FAQ MANAGEMENT SECTION ==================== */}
        {activeSection === 'faq' && (
          <>
            <div className="faq-header">
              <h2>FAQ Management</h2>
              <div className="faq-summary">
                <span className="badge badge-total">Total: {faqList.length}</span>
                <span className="badge badge-active">
                  Active: {faqList.filter(f => f.is_active === 1).length}
                </span>
                <span className="badge badge-inactive">
                  Inactive: {faqList.filter(f => f.is_active === 0).length}
                </span>
              </div>
            </div>

            {/* CREATE NEW FAQ FORM */}
            <div className="faq-create-form">
              <h3>Add New FAQ</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  >
                    <option value="Umum">Umum</option>
                    <option value="Fitur">Fitur</option>
                    <option value="Penggunaan">Penggunaan</option>
                    <option value="Teknis">Teknis</option>
                    <option value="Export & Sharing">Export & Sharing</option>
                    <option value="Virtual Tour">Virtual Tour</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={newFaq.display_order}
                    onChange={(e) => setNewFaq({ ...newFaq, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newFaq.is_active}
                    onChange={(e) => setNewFaq({ ...newFaq, is_active: parseInt(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="Enter the question..."
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Enter the answer..."
                  rows="4"
                />
              </div>

              <button className="btn-primary" onClick={handleCreateFaq}>
                Add FAQ
              </button>
            </div>

            {/* FAQ LIST */}
            <div className="faq-list-section">
              <h3>Existing FAQs</h3>
              
              {faqList.length === 0 ? (
                <div className="empty-state">
                  <p>No FAQs found. Create your first FAQ above!</p>
                </div>
              ) : (
                <div className="faq-table-wrapper">
                  <table className="faq-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqList.map((faq) => (
                        editingFaq?.id === faq.id ? (
                          // EDIT MODE
                          <tr key={faq.id} className="editing-row">
                            <td>
                              <select
                                value={editingFaq.category}
                                onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                              >
                                <option value="Umum">Umum</option>
                                <option value="Fitur">Fitur</option>
                                <option value="Penggunaan">Penggunaan</option>
                                <option value="Teknis">Teknis</option>
                                <option value="Export & Sharing">Export & Sharing</option>
                                <option value="Virtual Tour">Virtual Tour</option>
                                <option value="Support">Support</option>
                              </select>
                            </td>
                            <td>
                              <textarea
                                value={editingFaq.question}
                                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                rows="2"
                              />
                            </td>
                            <td>
                              <textarea
                                value={editingFaq.answer}
                                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                                rows="3"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={editingFaq.display_order}
                                onChange={(e) => setEditingFaq({ ...editingFaq, display_order: parseInt(e.target.value) || 0 })}
                                style={{ width: '60px' }}
                              />
                            </td>
                            <td>
                              <select
                                value={editingFaq.is_active}
                                onChange={(e) => setEditingFaq({ ...editingFaq, is_active: parseInt(e.target.value) })}
                              >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                              </select>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-save"
                                  onClick={() => handleUpdateFaq(faq.id, editingFaq)}
                                  title="Save changes"
                                >
                                  Save
                                </button>
                                <button
                                  className="btn-cancel"
                                  onClick={() => setEditingFaq(null)}
                                  title="Cancel edit"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          // VIEW MODE
                          <tr key={faq.id}>
                            <td>
                              <span className="category-badge">{faq.category}</span>
                            </td>
                            <td>
                              <div className="faq-question">{faq.question}</div>
                            </td>
                            <td>
                              <div className="faq-answer">{faq.answer}</div>
                            </td>
                            <td className="text-center">
                              {faq.display_order}
                            </td>
                            <td>
                              <span className={`status-badge ${faq.is_active === 1 ? 'active' : 'inactive'}`}>
                                {faq.is_active === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-edit"
                                  onClick={() => setEditingFaq({...faq})}
                                  title="Edit FAQ"
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  title="Delete FAQ"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= CONTACT MESSAGES SECTION ================= */}
        {activeSection === 'messages' && (
          <>
            <div className="admin-section">
              <div className="faq-header">
                <h2>Contact Messages</h2>
                <div className="faq-summary">
                  <span className="badge badge-total">Total: {contactMessages.length}</span>
                  <span className="badge badge-active">New: {contactMessages.filter(m => m.status === 'new').length}</span>
                  <span className="badge badge-inactive">Read: {contactMessages.filter(m => m.status === 'read').length}</span>
                </div>
              </div>

              <div className="form-group" style={{marginBottom: '2rem'}}>
                <label>Filter Messages</label>
                <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
                  <option value="all">All Messages</option>
                  <option value="new">New Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>

              {filteredMessages.length === 0 ? (
                <p className="empty-state">No messages found</p>
              ) : (
                <div className="faq-table-wrapper">
                  <table className="faq-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email / Phone</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map(msg => (
                        <tr key={msg.id}>
                          <td><strong>{msg.name}</strong></td>
                          <td>
                            <div>{msg.email}</div>
                            {msg.phone && <div style={{fontSize: '0.85rem', opacity: 0.7}}>{msg.phone}</div>}
                          </td>
                          <td>{msg.subject || '-'}</td>
                          <td style={{maxWidth: '300px'}}>
                            <div style={{
                              maxHeight: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {msg.message}
                            </div>
                          </td>
                          <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${msg.status}`}>
                              {msg.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {msg.status === 'new' && (
                                <button
                                  className="btn-edit"
                                  onClick={() => handleMarkAsRead(msg.id)}
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteMessage(msg.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= SOCIAL MEDIA SECTION ================= */}
        {activeSection === 'social' && (
          <>
            <div className="admin-section">
              <div className="faq-header">
                <h2>Social Media Links</h2>
                <div className="faq-summary">
                  <span className="badge badge-total">Total: {socialMediaList.length}</span>
                  <span className="badge badge-active">Active: {socialMediaList.filter(s => s.is_active).length}</span>
                </div>
              </div>

              {/* Create Social Media */}
              <div className="faq-create-form">
                <h3>Add New Social Media Link</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Platform *</label>
                    <input
                      type="text"
                      value={newSocial.platform}
                      onChange={(e) => setNewSocial({...newSocial, platform: e.target.value})}
                      placeholder="facebook, instagram, twitter, etc"
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Name *</label>
                    <input
                      type="text"
                      value={newSocial.platform_name}
                      onChange={(e) => setNewSocial({...newSocial, platform_name: e.target.value})}
                      placeholder="Facebook, Instagram, etc"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>URL *</label>
                    <input
                      type="url"
                      value={newSocial.url}
                      onChange={(e) => setNewSocial({...newSocial, url: e.target.value})}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon Class</label>
                    <input
                      type="text"
                      value={newSocial.icon}
                      onChange={(e) => setNewSocial({...newSocial, icon: e.target.value})}
                      placeholder="fab fa-facebook"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={newSocial.display_order}
                      onChange={(e) => setNewSocial({...newSocial, display_order: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={newSocial.is_active}
                      onChange={(e) => setNewSocial({...newSocial, is_active: parseInt(e.target.value)})}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleCreateSocial} className="btn-primary">
                  Add Social Media Link
                </button>
              </div>

              {/* Social Media List */}
              {socialMediaList.length === 0 ? (
                <p className="empty-state">No social media links yet</p>
              ) : (
                <div className="faq-table-wrapper">
                  <table className="faq-table">
                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>Display Name</th>
                        <th>URL</th>
                        <th>Icon</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialMediaList.map(social => (
                        <tr key={social.id} className={editingSocial?.id === social.id ? 'editing-row' : ''}>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <input
                                type="text"
                                value={editingSocial.platform}
                                onChange={(e) => setEditingSocial({...editingSocial, platform: e.target.value})}
                              />
                            ) : (
                              <span className="category-badge">{social.platform}</span>
                            )}
                          </td>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <input
                                type="text"
                                value={editingSocial.platform_name}
                                onChange={(e) => setEditingSocial({...editingSocial, platform_name: e.target.value})}
                              />
                            ) : (
                              social.platform_name
                            )}
                          </td>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <input
                                type="url"
                                value={editingSocial.url}
                                onChange={(e) => setEditingSocial({...editingSocial, url: e.target.value})}
                              />
                            ) : (
                              <a href={social.url} target="_blank" rel="noopener noreferrer" style={{color: '#ffffff', textDecoration: 'underline'}}>
                                {social.url}
                              </a>
                            )}
                          </td>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <input
                                type="text"
                                value={editingSocial.icon}
                                onChange={(e) => setEditingSocial({...editingSocial, icon: e.target.value})}
                              />
                            ) : (
                              social.icon || '-'
                            )}
                          </td>
                          <td>{social.display_order}</td>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <select
                                value={editingSocial.is_active}
                                onChange={(e) => setEditingSocial({...editingSocial, is_active: parseInt(e.target.value)})}
                              >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                              </select>
                            ) : (
                              <span className={`status-badge ${social.is_active ? 'active' : 'inactive'}`}>
                                {social.is_active ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingSocial?.id === social.id ? (
                              <div className="action-buttons">
                                <button
                                  className="btn-save"
                                  onClick={() => handleUpdateSocial(social.id, editingSocial)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn-cancel"
                                  onClick={() => setEditingSocial(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="action-buttons">
                                <button
                                  className="btn-edit"
                                  onClick={() => setEditingSocial({...social})}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteSocial(social.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= HOUSE LAYOUTS SECTION ================= */}
        {activeSection === 'layouts' && (
          <>
            <div className="admin-section">
              <div className="section-header">
                <h2>🏠 House Layouts Management</h2>
                <div className="header-badges">
                  <span className="badge badge-info">Total: {layoutsList.length}</span>
                  <span className="badge badge-success">
                    Public: {layoutsList.filter(l => l.is_public).length}
                  </span>
                  <span className="badge badge-secondary">
                    Private: {layoutsList.filter(l => !l.is_public).length}
                  </span>
                </div>
              </div>

              {/* Filter */}
              <div className="filter-section" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="layouts-filter" style={{ marginRight: '1rem', color: '#fff' }}>Filter:</label>
                <select 
                  id="layouts-filter"
                  value={layoutsFilter} 
                  onChange={(e) => setLayoutsFilter(e.target.value)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#000', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">All Layouts</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              {/* Layouts Table */}
              {layoutsList.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '3rem' }}>No layouts saved yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Layout Name</th>
                        <th>House Type</th>
                        <th>User</th>
                        <th>Visibility</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layoutsList
                        .filter(layout => {
                          if (layoutsFilter === 'public') return layout.is_public;
                          if (layoutsFilter === 'private') return !layout.is_public;
                          return true;
                        })
                        .map((layout) => (
                        <tr key={layout.id}>
                          <td>{layout.id}</td>
                          <td>
                            <strong style={{ color: '#fff' }}>{layout.layout_name || 'Untitled'}</strong>
                          </td>
                          <td>
                            <span className="badge badge-info">{layout.house_type || 'Custom'}</span>
                          </td>
                          <td style={{ color: '#aaa' }}>
                            {layout.username || `User #${layout.user_id}`}
                          </td>
                          <td>
                            {layout.is_public ? (
                              <span className="badge badge-success">Public</span>
                            ) : (
                              <span className="badge badge-secondary">Private</span>
                            )}
                          </td>
                          <td style={{ color: '#999', fontSize: '0.85rem' }}>
                            {new Date(layout.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-toggle"
                                onClick={() => handleToggleLayoutPublic(layout.id)}
                                title={layout.is_public ? 'Make Private' : 'Make Public'}
                              >
                                {layout.is_public ? '👁️ Hide' : '👁️‍🗨️ Show'}
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteLayout(layout.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= ACTIVITY LOGS SECTION ================= */}
        {activeSection === 'activity' && (
          <>
            <div className="admin-section">
              <div className="section-header">
                <h2>📋 Activity Logs</h2>
                <div className="header-badges">
                  <span className="badge badge-info">Total Logs: {activityLogs.length}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="filter-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label htmlFor="logs-limit" style={{ marginRight: '0.5rem', color: '#fff' }}>Show:</label>
                  <select 
                    id="logs-limit"
                    value={logsLimit} 
                    onChange={(e) => setLogsLimit(Number(e.target.value))}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#000', 
                      color: '#fff', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px'
                    }}
                  >
                    <option value={50}>Last 50 logs</option>
                    <option value={100}>Last 100 logs</option>
                    <option value={200}>Last 200 logs</option>
                    <option value={500}>Last 500 logs</option>
                  </select>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-warning"
                    onClick={() => handleCleanupLogs(30)}
                    style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107', border: '1px solid rgba(255,193,7,0.3)' }}
                  >
                    🗑️ Delete 30+ days old
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleCleanupLogs(90)}
                    style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)' }}
                  >
                    🗑️ Delete 90+ days old
                  </button>
                </div>
              </div>

              {/* Activity Logs Table */}
              {activityLogs.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '3rem' }}>No activity logs found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>Description</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ color: '#666' }}>#{log.id}</td>
                          <td>
                            <strong style={{ color: '#fff' }}>{log.username || `User #${log.user_id}`}</strong>
                            {log.email && <div style={{ fontSize: '0.8rem', color: '#888' }}>{log.email}</div>}
                          </td>
                          <td>
                            <span className={`badge ${
                              log.action.includes('create') ? 'badge-success' :
                              log.action.includes('update') ? 'badge-info' :
                              log.action.includes('delete') ? 'badge-danger' :
                              'badge-secondary'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ color: '#aaa' }}>
                            {log.entity_type && log.entity_id ? (
                              <span>{log.entity_type} #{log.entity_id}</span>
                            ) : (
                              <span style={{ color: '#666' }}>-</span>
                            )}
                          </td>
                          <td style={{ color: '#ccc', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.description || '-'}
                          </td>
                          <td style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {log.ip_address || '-'}
                          </td>
                          <td style={{ color: '#999', fontSize: '0.85rem' }}>
                            {new Date(log.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= THEME SECTION ================= */}
        {activeSection === 'theme' && currentTheme && (
          <>
            <section className="admin-section">
              <h2>Theme Settings</h2>
              <p style={{ color: '#cccccc', marginBottom: '2rem' }}>
                Customize the appearance of your website. Changes will be applied globally.
              </p>

              {/* NAVBAR COLOR */}
              <div className="theme-subsection">
                <h3>Navbar Settings</h3>
                
                <div className="form-group">
                  <label>Navbar Background Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={currentTheme.navbarColor || '#0a0a0a'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarColor: e.target.value })}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={currentTheme.navbarColor || '#0a0a0a'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarColor: e.target.value })}
                      className="color-text-input"
                      placeholder="#0a0a0a"
                    />
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Choose the background color for the navigation bar
                  </small>
                </div>

                <div className="form-group">
                  <label>Navbar Text Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={currentTheme.navbarTextColor || '#ffffff'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarTextColor: e.target.value })}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={currentTheme.navbarTextColor || '#ffffff'}
                      onChange={(e) => setEditTheme({ ...currentTheme, navbarTextColor: e.target.value })}
                      className="color-text-input"
                      placeholder="#ffffff"
                    />
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Choose the text color for navigation links and logo
                  </small>
                </div>
              </div>

              {/* TYPOGRAPHY */}
              <div className="theme-subsection">
                <h3>Typography</h3>
                <div className="form-group">
                  <label>Font Family</label>
                  <select
                    value={currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}
                    onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                    style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                  >
                    <option value="'Inter', 'Poppins', 'Segoe UI', sans-serif">Inter / Poppins (Default)</option>
                    <option value="'Poppins', sans-serif">Poppins (Modern)</option>
                    <option value="'Inter', sans-serif">Inter (Clean)</option>
                    <option value="'Roboto', sans-serif">Roboto (Google)</option>
                    <option value="'Open Sans', sans-serif">Open Sans (Friendly)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
                    <option value="'Lato', sans-serif">Lato (Professional)</option>
                    <option value="'Raleway', sans-serif">Raleway (Elegant)</option>
                    <option value="'Nunito', sans-serif">Nunito (Rounded)</option>
                    <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                    <option value="'Merriweather', serif">Merriweather (Classic)</option>
                    <option value="'Arial', sans-serif">Arial (System)</option>
                    <option value="'Segoe UI', sans-serif">Segoe UI (Windows)</option>
                    <option value="'Georgia', serif">Georgia (Traditional)</option>
                  </select>
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Select a font that will be used across the entire website
                  </small>
                </div>

                <div className="form-group">
                  <label>Custom Font Family (Advanced)</label>
                  <input
                    type="text"
                    value={currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}
                    onChange={(e) => setEditTheme({ ...currentTheme, fontFamily: e.target.value })}
                    placeholder="e.g., 'Poppins', sans-serif"
                  />
                  <small style={{ display: 'block', marginTop: '8px', color: '#b3b3b3' }}>
                    Enter a custom font family or Google Fonts import
                  </small>
                </div>
              </div>

              {/* PREVIEW */}
              <div className="theme-preview-box">
                <h3>Preview</h3>
                
                {/* Navbar Preview */}
                <div className="preview-navbar" style={{ 
                  background: currentTheme.navbarColor || '#0a0a0a',
                  fontFamily: currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"
                }}>
                  <div className="preview-navbar-logo" style={{
                    color: currentTheme.navbarTextColor || '#ffffff'
                  }}>
                    Virtual Tour App
                  </div>
                  <div className="preview-navbar-links">
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>Home</span>
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>About</span>
                    <span style={{ color: currentTheme.navbarTextColor || '#ffffff' }}>Contact</span>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="preview-content" style={{ 
                  fontFamily: currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"
                }}>
                  <h1>Heading 1 - Main Title</h1>
                  <h2>Heading 2 - Section Title</h2>
                  <h3>Heading 3 - Subsection</h3>
                  <p>
                    This is a preview of how your text will look with the selected font family. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <button className="preview-button">
                    Sample Button
                  </button>
                  <div className="preview-info">
                    <p><strong>Navbar Background:</strong> {currentTheme.navbarColor || '#0a0a0a'}</p>
                    <p><strong>Navbar Text:</strong> {currentTheme.navbarTextColor || '#ffffff'}</p>
                    <p><strong>Font Family:</strong> {currentTheme.fontFamily || "'Inter', 'Poppins', 'Segoe UI', sans-serif"}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ==================== Q&A MANAGEMENT SECTION ==================== */}
        {activeSection === 'qna' && (
          <>
            <div className="qna-header">
              <h2>Q&A Management</h2>
              <div className="qna-summary">
                <span className="badge badge-total">Total: {questionsList.length}</span>
                <span className="badge badge-pending">
                  Pending: {questionsList.filter(q => q.status === 'pending').length}
                </span>
                <span className="badge badge-answered">
                  Answered: {questionsList.filter(q => q.status === 'answered').length}
                </span>
              </div>
            </div>

            {/* Filter */}
            <div className="qna-filter">
              <button 
                className={`filter-btn ${qnaFilter === 'all' ? 'active' : ''}`}
                onClick={() => setQnaFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setQnaFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${qnaFilter === 'answered' ? 'active' : ''}`}
                onClick={() => setQnaFilter('answered')}
              >
                Answered
              </button>
            </div>

            {/* Answer Form (when question selected) */}
            {selectedQuestion && (
              <div className="answer-form-card">
                <h3>Answer Question</h3>
                <div className="question-detail">
                  <div className="detail-row">
                    <strong>From:</strong> {selectedQuestion.name} ({selectedQuestion.email})
                  </div>
                  <div className="detail-row">
                    <strong>Date:</strong> {selectedQuestion.created_at}
                  </div>
                  <div className="detail-row">
                    <strong>Question:</strong>
                    <p className="question-text">{selectedQuestion.question}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Answer *</label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label>Answered By</label>
                  <input
                    type="text"
                    value={answeredBy}
                    onChange={(e) => setAnsweredBy(e.target.value)}
                    placeholder="Admin name"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={submitAnswer}>
                    Submit Answer
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerText('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="questions-table">
              {filteredQuestions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Question</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className={q.status === 'pending' ? 'pending-row' : ''}>
                        <td>{q.id}</td>
                        <td>
                          <div className="user-info">
                            <strong>{q.name}</strong>
                            <small>{q.email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="question-preview">
                            {q.question.substring(0, 80)}
                            {q.question.length > 80 && '...'}
                          </div>
                          {q.answer && (
                            <div className="answer-preview">
                              Answered: {q.answer.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${q.status}`}>
                            {q.status === 'pending' ? 'Pending' : 'Answered'}
                          </span>
                        </td>
                        <td>
                          <small>{q.created_at}</small>
                          {q.answered_at && (
                            <>
                              <br />
                              <small className="answered-date">
                                Answered: {q.answered_at}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-answer"
                              onClick={() => handleAnswerQuestion(q)}
                              title={q.status === 'answered' ? 'Edit answer' : 'Answer question'}
                            >
                              {q.status === 'answered' ? 'Edit' : 'Answer'}
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => deleteQuestion(q.id)}
                              title="Delete question"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
