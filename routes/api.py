"""
API Routes
Define all API routes
"""
from flask import Blueprint
from app.controllers import (
    NewsController,
    CMSController,
    QuestionController,
    AuthController
)
from app.controllers.LayoutController import LayoutController

# Create blueprint
api = Blueprint('api', __name__, url_prefix='/api')

# ===== STATUS =====
@api.route('/status', methods=['GET'])
def status():
    from flask import jsonify
    return jsonify({
        "status": "success",
        "service": "FurniLayout API",
        "version": "2.0.0"
    })

# ===== NEWS ROUTES =====
@api.route('/news', methods=['GET'])
def get_news():
    return NewsController.index()

@api.route('/news/<int:news_id>', methods=['GET'])
def get_news_detail(news_id):
    return NewsController.show(news_id)

@api.route('/news', methods=['POST'])
def create_news():
    return NewsController.store()

@api.route('/news/<int:news_id>', methods=['PUT'])
def update_news(news_id):
    return NewsController.update(news_id)

@api.route('/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    return NewsController.destroy(news_id)

# ===== CMS ROUTES =====
@api.route('/cms/content', methods=['GET'])
def get_cms_content():
    return CMSController.get_content()

@api.route('/cms/content', methods=['PUT'])
def update_cms_content():
    return CMSController.update_content()

@api.route('/cms/theme', methods=['GET'])
def get_theme():
    return CMSController.get_theme()

@api.route('/cms/theme', methods=['PUT'])
def update_theme():
    return CMSController.update_theme()

# ===== QUESTION ROUTES =====
@api.route('/questions', methods=['POST'])
def submit_question():
    return QuestionController.store()

@api.route('/questions/answered', methods=['GET'])
def get_answered_questions():
    return QuestionController.get_answered()

@api.route('/questions/all', methods=['GET'])
def get_all_questions():
    return QuestionController.index()

@api.route('/questions/<int:question_id>/answer', methods=['PUT'])
def answer_question(question_id):
    return QuestionController.answer(question_id)

@api.route('/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    return QuestionController.destroy(question_id)

# ===== AUTH ROUTES =====
@api.route('/cms/login', methods=['POST'])
def admin_login():
    return AuthController.login()

# ===== LAYOUT ROUTES =====
@api.route('/layout/predict', methods=['POST'])
def predict_layout():
    return LayoutController.predict_batch()

@api.route('/layout/recommendations', methods=['POST'])
def get_recommendations():
    return LayoutController.get_floor_recommendations()

@api.route('/layout/reset', methods=['POST'])
def reset_layout():
    return LayoutController.reset_layout()

@api.route('/layout/auto-place', methods=['POST'])
def auto_place_furniture():
    return LayoutController.auto_place_furniture()

# ===== UPLOAD ROUTES =====
@api.route('/news/upload-image', methods=['POST'])
def upload_image():
    return LayoutController.upload_news_image()

@api.route('/news/images/<filename>', methods=['GET'])
def serve_image(filename):
    return LayoutController.serve_news_image(filename)
