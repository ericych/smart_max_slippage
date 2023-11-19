# Smart Max Slippage
Smart Max Slippage is an advanced recommender for optimal slippage tolerance, leveraging time series model predictions. It aids users in mitigating potential losses during swaps while maintaining a high success rate. Utilizing the ARIMA model, a proven and robust time series predictor, Smart Max Slippage has demonstrated a 98% accuracy rate in retrospective testing.

# How it's Made
The architecture begins with the front-end, where we employ the DODO trading widget. This widget, developed in TypeScript and Node.js, captures user inputs regarding the swap tokens. The input is then used to request token price data for the past several hours from the GeckoTerminal API. Subsequently, this price data is processed by the Slippage Predictor, which is an ARIMA model developed using Python packages. Finally, the prediction result is relayed back to the front-end, automatically adjusting the manual slippage setting for immediate user application. 

For efficient time series model training within a constrained timeframe, we categorized tokens into three types: stables, long-tail, and mainstream. The mainstream category is defined using the top list from CoinMarketCap. Each category undergoes a 1-day rolling window retrospective training for all coins, ensuring the derivation of the most fitting model for each token type.

# Installation
```
cd front-end
npm install
```

# Usage (Front-End)
```
npm run dev
```

# Usage (Backend)
```
cd time_series_forecast
docker build -t foo .
docker run -it foo
```