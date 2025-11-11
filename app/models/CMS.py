"""
CMS Model
Mengelola CMS content dan theme
"""
import json
from app.models.BaseModel import BaseModel

class CMS(BaseModel):
    """CMS model untuk content dan theme"""
    
    @classmethod
    def get_all_content(cls):
        """Get all CMS content"""
        conn = cls.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT section, content FROM cms_content")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        content = {}
        for r in rows:
            # Skip null or empty content
            if r["content"] is None:
                continue
                
            try:
                content[r["section"]] = r["content"]
                if isinstance(content[r["section"]], str):
                    content[r["section"]] = json.loads(content[r["section"]])
            except Exception:
                try:
                    content[r["section"]] = json.loads(r["content"])
                except Exception:
                    content[r["section"]] = r["content"]
        return content
    
    @classmethod
    def upsert_section(cls, section, content_obj):
        """Insert or update CMS section"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cms_content (section, content) VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE content = VALUES(content)
        """, (section, json.dumps(content_obj, ensure_ascii=False)))
        cursor.close()
        conn.close()
        return True
    
    @classmethod
    def get_theme(cls):
        """Get theme configuration"""
        conn = cls.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT theme_json FROM theme WHERE id = 1 LIMIT 1")
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if row and row.get("theme_json"):
            try:
                return row["theme_json"] if isinstance(row["theme_json"], dict) else json.loads(row["theme_json"])
            except Exception:
                try:
                    return json.loads(row["theme_json"])
                except:
                    return {}
        return {}
    
    @classmethod
    def upsert_theme(cls, theme_obj):
        """Insert or update theme"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO theme (id, theme_json) VALUES (1, %s)
            ON DUPLICATE KEY UPDATE theme_json = VALUES(theme_json)
        """, (json.dumps(theme_obj, ensure_ascii=False),))
        cursor.close()
        conn.close()
        return True
