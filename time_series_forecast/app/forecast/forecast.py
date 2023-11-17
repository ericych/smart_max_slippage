from pmdarima import ARIMA
import pandas as pd
import numpy as np
import time

def get_model(category):
  category = category.lower()
  return {
    "stable": ARIMA((1, 1, 0)),
    "mainstream": ARIMA((1, 1, 3)),
    "long-tail": ARIMA((3, 1, 5)),
  }[category] or ARIMA((0, 0, 0))


def predict_next_slippage(category, data, n = 1):
  start_time = time.time()

  model = get_model(category)
  model.fit(pd.Series(data, dtype='float64'))

  fc, conf_int = model.predict(n_periods=n, return_conf_int=True, alpha=0.02)
  end_time = time.time()
  print("Category {}, amount: {}, time taken: {:.2f}s".format(category, len(data), end_time - start_time))
  
  return (
    fc.tolist()[0],
    conf_int.tolist()[0]
  )