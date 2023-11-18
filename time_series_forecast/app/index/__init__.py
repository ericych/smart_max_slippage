from flask import Blueprint

index_bp = Blueprint("index", __name__)

@index_bp.route('/')
def hello_world():
    return 'Hello, World!'

@index_bp.route('/k8s/healthz')
def healthz():
    return 'ok', 200