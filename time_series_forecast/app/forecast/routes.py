from flask import request, jsonify
from . import forecast_bp
from .forecast import predict_next_slippage

@forecast_bp.post('/slippage')
def predict_slippage():
    try:
        body = request.get_json()
        print(body)
    except Exception as e:
        return jsonify({'error': 'Invalid JSON', 'code': 400}), 400

    try:
        data = list(body['data'])
        # if len(data) <= 0:
        #     return jsonify({'error': 'Array must has integer values', 'code': 400}), 400
    except Exception as e:
        return jsonify({'error': 'Invalid Array', 'code': 400}), 400

    value, confidence_intervals = predict_next_slippage(body['kind'], data)

    response_data = {'data': {
        'value': value,
        'confidence_intervals': confidence_intervals
    }, 'code': 200}
    return jsonify(response_data), 200