from flask import Blueprint

forecast_bp = Blueprint("forecast", __name__)

from . import routes