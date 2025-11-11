"""
News Controller
Menangani semua request terkait berita
"""
from flask import jsonify, request
from app.models.News import News

class NewsController:
    """Controller untuk news endpoints"""
    
    @staticmethod
    def index():
        """Get all news"""
        news = News.get_all()
        return jsonify({
            "status": "success",
            "news": news
        })
    
    @staticmethod
    def show(news_id):
        """Get single news by ID"""
        news = News.find_by_id(news_id)
        if news:
            return jsonify({
                "status": "success",
                "news": news
            })
        return jsonify({
            "status": "error",
            "message": "News not found"
        }), 404
    
    @staticmethod
    def store():
        """Create new news"""
        data = request.json or {}
        if not data.get("title"):
            return jsonify({
                "status": "error",
                "message": "Title required"
            }), 400
        
        new_id = News.create(data)
        return jsonify({
            "status": "success",
            "message": "News created",
            "id": new_id
        }), 201
    
    @staticmethod
    def update(news_id):
        """Update news"""
        data = request.json or {}
        success = News.update(news_id, data)
        if success:
            return jsonify({
                "status": "success",
                "message": "News updated"
            })
        return jsonify({
            "status": "error",
            "message": "News not found or no changes made"
        }), 404
    
    @staticmethod
    def destroy(news_id):
        """Delete news"""
        success = News.delete_by_id(news_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "News deleted"
            })
        return jsonify({
            "status": "error",
            "message": "News not found"
        }), 404
