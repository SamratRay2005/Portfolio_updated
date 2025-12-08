from flask import Flask, render_template, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from dotenv import load_dotenv
from bson import json_util
import json
from pymongo.errors import ServerSelectionTimeoutError

load_dotenv()

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
CORS(app)

# Helper to parse Mongo BSON to JSON
def parse_json(data):
    return json.loads(json_util.dumps(data))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    try:
        # Fetching data from all collections defined in your seed.js
        db = mongo.db
        
        # Profile is a single object, others are arrays
        profile = db.profiles.find_one()
        projects = list(db.projects.find())
        education = list(db.educations.find())
        skills = list(db.skills.find())
        certifications = list(db.certifications.find())
        achievements = list(db.achievements.find())

        payload = {
            "profile": parse_json(profile),
            "projects": parse_json(projects),
            "education": parse_json(education),
            "skills": parse_json(skills),
            "certifications": parse_json(certifications),
            "achievements": parse_json(achievements)
        }
        
        return jsonify(payload)
    except ServerSelectionTimeoutError:
        print("Error: Could not connect to MongoDB. Check your IP whitelist in MongoDB Atlas.")
        return jsonify({"error": "Database connection timeout. Please check your IP whitelist in MongoDB Atlas."}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)