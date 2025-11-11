// src/services/cmsApi.js
const API_BASE_URL = 'http://localhost:5000/api';

export const cmsApi = {
  // =========================
  // LOGIN
  // =========================
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cms/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include', // aktifkan kalau backend pakai cookie
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return { status: 'error', message: '⚠️ Invalid server response (not JSON)' };
      }

      console.log('Login API response:', data);

      if (response.ok && data.status === 'success') {
        return {
          status: 'success',
          token: data.token || null,
          message: data.message || 'Login successful',
        };
      }

      return {
        status: 'error',
        message: data.message || 'Login failed',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 'error',
        message: '❌ Network error. Please check if backend is running.',
      };
    }
  },

  // =========================
// NEWS
// =========================
getNews: async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/news`, { credentials: 'include' });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get news error:", err);
    return { status: "error", message: "Failed to fetch news" };
  }
},

uploadNewsImage: async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE_URL}/news/upload-image`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Upload image error:", err);
    return { status: "error", message: "Failed to upload image" };
  }
},

createNews: async (newsData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData),
    });
    return await res.json();
  } catch (err) {
    console.error("Create news error:", err);
    return { status: "error", message: "Failed to create news" };
  }
},

updateNews: async (id, newsData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData),
    });
    return await res.json();
  } catch (err) {
    console.error("Update news error:", err);
    return { status: "error", message: "Failed to update news" };
  }
},

deleteNews: async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("Delete news error:", err);
    return { status: "error", message: "Failed to delete news" };
  }
},

// =========================
// FAQ
// =========================
getFAQs: async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/active`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get FAQs error:", err);
    return { status: "error", message: "Failed to fetch FAQs" };
  }
},

getAllFAQs: async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get all FAQs error:", err);
    return { status: "error", message: "Failed to fetch FAQs" };
  }
},

createFAQ: async (faqData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqData),
    });
    return await res.json();
  } catch (err) {
    console.error("Create FAQ error:", err);
    return { status: "error", message: "Failed to create FAQ" };
  }
},

updateFAQ: async (id, faqData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqData),
    });
    return await res.json();
  } catch (err) {
    console.error("Update FAQ error:", err);
    return { status: "error", message: "Failed to update FAQ" };
  }
},

deleteFAQ: async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("Delete FAQ error:", err);
    return { status: "error", message: "Failed to delete FAQ" };
  }
},

// =========================
// Q&A (QUESTIONS)
// =========================
getAllQuestions: async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/all`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get all questions error:", err);
    return { status: "error", message: "Failed to fetch questions" };
  }
},

getAnsweredQuestions: async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/answered`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Get answered questions error:", err);
    return { status: "error", message: "Failed to fetch questions" };
  }
},

submitQuestion: async (questionData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    return await res.json();
  } catch (err) {
    console.error("Submit question error:", err);
    return { status: "error", message: "Failed to submit question" };
  }
},

answerQuestion: async (id, answerData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/${id}/answer`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answerData),
    });
    return await res.json();
  } catch (err) {
    console.error("Answer question error:", err);
    return { status: "error", message: "Failed to answer question" };
  }
},

deleteQuestion: async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("Delete question error:", err);
    return { status: "error", message: "Failed to delete question" };
  }
},

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    return { status: 'success', message: 'Logged out locally' };
  },

  // =========================
  // UPDATE CMS CONTENT
  // =========================
  updateContent: async (section, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cms/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return { status: 'error', message: '⚠️ Invalid server response (not JSON)' };
      }

      return {
        status: data.status || (response.ok ? 'success' : 'error'),
        message: data.message || (response.ok ? 'Content updated' : 'Update failed'),
        data: data.content || null,
      };
    } catch (error) {
      console.error('Update content error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // =========================
  // UPDATE THEME
  // =========================
  updateTheme: async (theme) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cms/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return { status: 'error', message: '⚠️ Invalid server response (not JSON)' };
      }

      return {
        status: data.status || (response.ok ? 'success' : 'error'),
        message: data.message || (response.ok ? 'Theme updated' : 'Update failed'),
      };
    } catch (error) {
      console.error('Update theme error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // =========================
  // CONTACT MESSAGES
  // =========================
  submitContact: async (contactData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Submit contact error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getContactMessages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get contact messages error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getUnreadMessages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages/unread`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get unread messages error:', error);
      return { status: 'error', message: error.message };
    }
  },

  markMessageRead: async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages/${messageId}/read`, {
        method: 'PUT',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Mark message read error:', error);
      return { status: 'error', message: error.message };
    }
  },

  deleteContactMessage: async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages/${messageId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete contact message error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // =========================
  // HOUSE LAYOUTS
  // =========================
  getAllLayouts: async (limit = 100) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get all layouts error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getPublicLayouts: async (limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/public?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get public layouts error:', error);
      return { status: 'error', message: error.message };
    }
  },

  saveLayout: async (layoutData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save layout error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getUserLayouts: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/user/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user layouts error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getLayoutDetail: async (layoutId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/${layoutId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get layout detail error:', error);
      return { status: 'error', message: error.message };
    }
  },

  updateLayout: async (layoutId, layoutData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/${layoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update layout error:', error);
      return { status: 'error', message: error.message };
    }
  },

  toggleLayoutPublic: async (layoutId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/${layoutId}/toggle-public`, {
        method: 'PUT',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle layout public error:', error);
      return { status: 'error', message: error.message };
    }
  },

  deleteLayout: async (layoutId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/layouts/${layoutId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete layout error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // =========================
  // ACTIVITY LOGS
  // =========================
  getAllActivityLogs: async (limit = 100) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-logs?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get activity logs error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getUserActivityLogs: async (userId, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-logs/user/${userId}?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user activity logs error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getEntityActivityLogs: async (entityType, entityId, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-logs/${entityType}/${entityId}?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get entity activity logs error:', error);
      return { status: 'error', message: error.message };
    }
  },

  cleanupOldLogs: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-logs/cleanup?days=${days}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cleanup logs error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // =========================
  // SOCIAL MEDIA
  // =========================
  getSocialMedia: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get social media error:', error);
      return { status: 'error', message: error.message };
    }
  },

  getActiveSocialMedia: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/active`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get active social media error:', error);
      return { status: 'error', message: error.message };
    }
  },

  createSocialMedia: async (socialData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create social media error:', error);
      return { status: 'error', message: error.message };
    }
  },

  updateSocialMedia: async (socialId, socialData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/${socialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update social media error:', error);
      return { status: 'error', message: error.message };
    }
  },

  deleteSocialMedia: async (socialId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/${socialId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete social media error:', error);
      return { status: 'error', message: error.message };
    }
  },
};
