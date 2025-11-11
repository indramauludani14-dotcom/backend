const API_URL = 'http://localhost:5000';

export const api = {
  async predictBatch(items) {
    const response = await fetch(`${API_URL}/predict_batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return response.json();
  },

  async resetLayout() {
    const response = await fetch(`${API_URL}/reset`, {
      method: 'POST'
    });
    return response.json();
  }
};