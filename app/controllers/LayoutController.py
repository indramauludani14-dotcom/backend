"""
LayoutController
Handle furniture layout prediction and file uploads
"""
from flask import request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from config import Config


class LayoutController:
    """Controller untuk layout prediction dan upload"""
    
    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    
    @staticmethod
    def predict_batch():
        """
        Predict furniture layout positions using ML model
        POST /api/layout/predict
        Body: {items: [], room_type: "", floor_data: {}}
        """
        try:
            from app.services.LayoutService import LayoutService
            
            data = request.get_json()
            items = data.get("items", [])
            room_type = data.get("room_type", "living_room")
            floor_data = data.get("floor_data", None)
            
            if not items:
                return jsonify({
                    "status": "error",
                    "message": "No items provided"
                }), 400
            
            # Initialize layout service (will load ML model)
            layout_service = LayoutService()
            
            # Predict positions using ML + collision detection
            results = layout_service.predict_batch(items, room_type, floor_data)
            
            return jsonify({
                "status": "success",
                "data": results,
                "room_type": room_type,
                "total_placed": len(results),
                "model_used": layout_service.model is not None
            })
            
        except Exception as e:
            import traceback
            print(f"Predict batch error: {e}")
            print(traceback.format_exc())
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    @staticmethod
    def get_floor_recommendations():
        """
        Get furniture recommendations for a floor
        POST /api/layout/recommendations
        Body: {floor: 1, floor_data: {}}
        """
        try:
            data = request.get_json()
            floor_number = data.get("floor", 1)
            
            # Default recommendations per floor
            recommendations_map = {
                1: [
                    {"name": "Sofa", "category": "seating"},
                    {"name": "Coffee Table", "category": "tables"},
                    {"name": "TV Stand", "category": "storage"},
                ],
                2: [
                    {"name": "Bed", "category": "bedroom"},
                    {"name": "Wardrobe", "category": "storage"},
                    {"name": "Nightstand", "category": "tables"},
                ],
                3: [
                    {"name": "Dining Table", "category": "tables"},
                    {"name": "Dining Chair", "category": "seating"},
                ]
            }
            
            recommendations = recommendations_map.get(floor_number, [])
            
            return jsonify({
                "status": "success",
                "data": recommendations
            })
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    @staticmethod
    def reset_layout():
        """
        Reset layout
        POST /api/layout/reset
        """
        return jsonify({
            "status": "success",
            "message": "Layout reset"
        })
    
    @staticmethod
    def auto_place_furniture():
        """
        Automatically place all furniture with optimal positioning
        POST /api/layout/auto-place
        Body: {room_width: 17.0, room_height: 11.0}
        """
        try:
            from app.services.AILayoutService import AILayoutService
            from app.services.SimpleLayoutService import SimpleLayoutService
            
            data = request.get_json() or {}
            room_width = data.get("room_width", 17.0)
            room_height = data.get("room_height", 11.0)
            use_ai = data.get("use_ai", True)  # Default: use AI model
            
            # Try AI model first, fallback to Simple if model not found
            if use_ai:
                print("🤖 Attempting AI-powered layout...")
                result = AILayoutService.auto_place_all_furniture(room_width, room_height)
                if not result.get("model_used", False):
                    print("⚠️ AI model not found, using deterministic algorithm")
            else:
                print("🔧 Using deterministic layout algorithm...")
                result = SimpleLayoutService.auto_place_all_furniture(room_width, room_height)
            
            return jsonify(result)
            
        except Exception as e:
            import traceback
            print(f"Auto place error: {e}")
            print(traceback.format_exc())
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    @staticmethod
    def upload_news_image():
        """
        Upload image for news
        POST /api/news/upload-image
        """
        try:
            if 'image' not in request.files:
                return jsonify({
                    "status": "error",
                    "message": "No file uploaded"
                }), 400
            
            file = request.files['image']
            
            if file.filename == '':
                return jsonify({
                    "status": "error",
                    "message": "No file selected"
                }), 400
            
            if file and LayoutController.allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to make filename unique
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"{timestamp}_{filename}"
                filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                file.save(filepath)
                
                # Return URL path
                image_url = f"http://localhost:5000/static/uploads/news/{filename}"
                return jsonify({
                    "status": "success",
                    "image_url": image_url
                })
            
            return jsonify({
                "status": "error",
                "message": "Invalid file type. Allowed: png, jpg, jpeg, gif, webp"
            }), 400
            
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 500
    
    @staticmethod
    def serve_news_image(filename):
        """
        Serve uploaded news images
        GET /static/uploads/news/<filename>
        """
        return send_from_directory(Config.UPLOAD_FOLDER, filename)
