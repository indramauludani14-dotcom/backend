import React, { useEffect, useState } from "react";
import { cmsApi } from "../services/cmsApi";
import "../styles/News.css";

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await cmsApi.getNews();
        
        if (res.status === "success") {
          setNews(res.news || []);
        } else {
          setError(res.message || "Gagal memuat berita");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat berita");
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  const categories = ['all', 'teknologi', 'bisnis', 'tutorial', 'update'];

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-loading">
          <div className="spinner"></div>
          <p>Memuat berita terkini...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="news-error">
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
    <div className="news-page">
      {/* Hero Header */}
      <div className="news-hero">
        <div className="news-hero-content">
          <span className="news-label">Berita & Artikel</span>
          <h1 className="news-main-title">Berita & Artikel Terbaru</h1>
          <p className="news-main-subtitle">
            Tetap update dengan informasi, tutorial, dan perkembangan terbaru dari virtualign.id
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="news-container">
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {filteredNews.length === 0 ? (
          <div className="news-empty">
            <h3>Belum Ada Berita</h3>
            <p>Saat ini belum ada berita yang tersedia untuk kategori ini.</p>
          </div>
        ) : (
          <>
            {/* Featured News (First Item) */}
            {filteredNews.length > 0 && (
              <div className="featured-news">
                <article className="featured-card">
                  {filteredNews[0].image && (
                    <div className="featured-image-wrapper">
                      <img
                        src={filteredNews[0].image}
                        alt={filteredNews[0].title}
                        className="featured-image"
                      />
                      <div className="featured-badge">Unggulan</div>
                    </div>
                  )}
                  <div className="featured-content">
                    <div className="featured-meta">
                      <span className="category-tag">
                        {filteredNews[0].category || 'Berita'}
                      </span>
                      <span className="date-text">
                        {formatDate(filteredNews[0].date)}
                      </span>
                    </div>
                    <h2 className="featured-title">{filteredNews[0].title}</h2>
                    <p className="featured-excerpt">
                      {filteredNews[0].excerpt || 
                       filteredNews[0].content?.substring(0, 200) + "..."}
                    </p>
                    <div className="featured-footer">
                      <div className="author-info">
                        <span className="author-name">{filteredNews[0].author}</span>
                      </div>
                      <button className="read-more-btn">Baca Selengkapnya</button>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* News Grid */}
            {filteredNews.length > 1 && (
              <div className="news-grid">
                {filteredNews.slice(1).map((item) => (
                  <article key={item.id} className="news-card">
                    {item.image && (
                      <div className="news-image-wrapper">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="news-image"
                          loading="lazy"
                        />
                        <div className="image-overlay"></div>
                      </div>
                    )}
                    <div className="news-content">
                      <div className="news-header">
                        <span className="category-tag small">
                          {item.category || 'Berita'}
                        </span>
                        <span className="read-time">5 menit</span>
                      </div>
                      <h3 className="news-card-title">{item.title}</h3>
                      <p className="news-excerpt">
                        {item.excerpt || 
                         (item.content?.substring(0, 120) + "...")}
                      </p>
                      <div className="news-footer">
                        <div className="author-section">
                          <div className="author-details">
                            <span className="author-name">{item.author}</span>
                            <span className="news-date">{formatDate(item.date)}</span>
                          </div>
                        </div>
                        <button className="read-link">Baca</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default News;