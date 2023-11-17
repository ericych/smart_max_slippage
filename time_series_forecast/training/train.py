from pmdarima import auto_arima, ARIMA
from matplotlib import pyplot as plt
import pandas as pd
import numpy as np
import time

def parse_data(file): 

    df = pd.read_json(file)
    df['Datetime'] = pd.to_datetime(df[0], unit = 'ms')
    df.set_index('Datetime', inplace=True)
    df = df[~df.index.duplicated()]
    df = df.asfreq(freq='30min', method='pad', fill_value=0)
    df.sort_values(by='Datetime', ascending=True, inplace=True)

    return df[4]


def get_arima_model(train_data, order = None, a = 0.95,**kwargs):
  if (order is None):
    kwargs['stepwise'] = False if kwargs['n_jobs'] != None else kwargs['stepwise']
    kwargs['alpha'] = 1 - a
    start_time = time.time()
    # , n_jobs, seasonal, maxiter, stepwise, alpha=1 - a
    model = auto_arima(train_data, trace=True, suppress_warnings=False, **kwargs)
    end_time = time.time()
    print("{:.2f}s".format(end_time - start_time))
  else:
    model = ARIMA(order)
    model.fit(train_data)

  return model

def auto_train_model(data, p = 0.8, maxiter=None, stepwise=None, n_jobs = -1):
    train_size = int(len(data) * p) 
    train_data = data[:train_size]
    test_data = data[train_size:]
    get_arima_model(train_data, a=0.98, maxiter=maxiter, stepwise=stepwise, n_jobs=n_jobs)

