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
};
