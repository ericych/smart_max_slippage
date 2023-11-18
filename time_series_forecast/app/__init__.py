def create_app():
  from flask import Flask
  from flask_cors import CORS
 
  app = Flask(__name__)
  CORS(app)

  from config import Config
  app.config.from_object(Config)

  from .index import index_bp
  from .forecast import forecast_bp
  app.register_blueprint(index_bp)
  app.register_blueprint(forecast_bp, url_prefix = '/forecast')
  
  return app