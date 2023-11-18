from app import create_app
from prometheus_flask_exporter import PrometheusMetrics

app = create_app()

metrics = PrometheusMetrics(app)