import { InitSwapWidget } from "@dodoex/widgets";
import type { SwapWidgetProps } from "@dodoex/widgets";
import BigNumber from "bignumber.js";

const baseUrl = "https://api.geckoterminal.com/api/v2/";
function getGeckoterminalTokenInfo(chainId: string | number, address: string) {
  const platforms: any = {
    "1": "eth",
    "56": "bsc",
    "128": "heco",
    "137": "polygon_pos",
    "66": "okexchain",
    "42161": "arbitrum",
    "1285": "movr",
    "1313161554": "aurora",
    "288": "boba",
    "43114": "avax",
    "10": "optimism",
    "25": "cro",
    "321": "kcc",
    "1030": "cfx",
    "8453": "base",
    "59144": "linea",
    // 534353: 'scr-alpha',
    // 534351: 'scr-sepolia',
    "534352": "scroll",
    "169": "manta-pacific",
  };
  if (!platforms[chainId.toString()]) {
    console.warn(
      "getOhlcvDataByGeckoterminal platforms NotFound",
      chainId,
      address
    );
    return;
  }
  const wrappedTokens: any = {
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": {
      "8453": "0x4200000000000000000000000000000000000006",
      "59144": "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
      // '137': '0x0000000000000000000000000000000000001010', 不需要转换
      "66": "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15",
      "169": "0x0dc808adce2099a9f62aa87d9670745aba741746",
    },
  };

  let tokenInfo;
  address = address.toLowerCase();
  if (wrappedTokens[address] && wrappedTokens[address][chainId.toString()]) {
    tokenInfo = `${platforms[chainId]}:${wrappedTokens[address][
      chainId.toString()
    ].toLowerCase()}`;
  } else {
    tokenInfo = `${platforms[chainId]}:${address}`;
  }
  return tokenInfo;
}

const cacheMap: any = {};
async function getOhlcvData(
  chainId: string | number,
  address: string,
  token = "base",
  timeframe = "minute",
  limit = 100
) {
  const tokenInfo = getGeckoterminalTokenInfo(chainId, address);
  if (!tokenInfo) return;
  const network = tokenInfo.split(":")[0];
  address = tokenInfo.split(":")[1];
  const tokenPoolsCacheKey = `geckoterminal:tokenPools:${tokenInfo}`;
  let tokenPools: any = cacheMap[tokenPoolsCacheKey];
  if (!(tokenPools && tokenPools.length > 0)) {
    try {
      const response = await fetch(
        baseUrl + `networks/${network}/tokens/${address}/pools`
      );
      const body = await response.json();
      tokenPools = body["data"];
      cacheMap[tokenPoolsCacheKey] = tokenPools;
    } catch (error) {
      console.warn(
        "getOhlcvDataByGeckoterminal get tokenPools error",
        chainId,
        address,
        error
      );
    }
  }

  if (!(tokenPools && tokenPools[0])) {
    console.warn(
      "getOhlcvDataByGeckoterminal tokenPools NotFound",
      chainId,
      address,
      tokenPools
    );
    return;
  }
  //过滤掉三池
  const tokenPool = tokenPools.find((pool: any) => {
    return pool?.attributes?.name?.split("/").length === 2;
  });
  if (!tokenPool) return;
  const poolAddress = tokenPool["attributes"]["address"];
  if (!poolAddress) return;
  let poolQuoteToken = tokenPool["relationships"]["quote_token"]["data"]["id"];
  poolQuoteToken = poolQuoteToken.split("_")[1];
  if (address === poolQuoteToken) {
    token = "quote";
  }
  let body;
  if (!body) {
    const response = await fetch(
      baseUrl +
        `networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}?limit=${limit}&token=${token}`
    );
    body = await response.json();
  }

  const ohlcv = body?.data?.attributes?.ohlcv_list;
  if (!ohlcv?.map) console.warn("getOhlcvDataByGeckoterminal body", body);
  if (ohlcv?.length && ohlcv?.map) {
    console.debug("getOhlcvDataByGeckoterminal ohlcv.length", ohlcv.length);
    return ohlcv;
  }
}

async function post(url: string, data: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const body = await response.json();
  return body;
}

async function forecastslippage(chainId: number, address: string) {
  let forecastSlippage = 0.11;
  try {
    let tokenOhlcvData = await getOhlcvData(chainId, address);
    tokenOhlcvData = tokenOhlcvData.map((item: any) => item[4]);
    const url = "http://127.0.0.1:8000" + "/forecast/slippage";
    const resData = (
      await post(url, {
        kind: "long-tail",
        data: tokenOhlcvData,
      })
    ).data;
    const lastPrice = tokenOhlcvData[tokenOhlcvData.length - 1];

    const lower =
      parseFloat(
        new BigNumber(lastPrice)
          .minus(resData.confidence_intervals[0])
          .abs()
          .div(lastPrice)
          .toFixed(6)
      ) * 100;
    const upper =
      parseFloat(
        new BigNumber(lastPrice)
          .minus(resData.confidence_intervals[1])
          .abs()
          .div(lastPrice)
          .toFixed(6)
      ) * 100;
    forecastSlippage = Math.max(lower, upper);
  } catch (error) {
    console.warn("forecastslippage error", chainId, address, error);
  }
  return forecastSlippage || 0.11;
}

const getAutoSlippage: SwapWidgetProps["getAutoSlippage"] = ({
  fromToken,
  toToken,
}) => {
  console.log(fromToken, toToken);
  if (!fromToken || !toToken || fromToken.chainId !== toToken.chainId)
    return undefined;

  /** TODO: Edit this. */
  return new Promise(async (resolve) => {
    try {
      const fromTokenForecastslippage = await forecastslippage(
        fromToken.chainId,
        fromToken.address
      );
      console.log(
        "fromTokenForecastslippage",
        fromToken.chainId,
        fromToken.symbol,
        fromTokenForecastslippage
      );
      const toTokenForecastslippage = await forecastslippage(
        toToken.chainId,
        toToken.address
      );
      console.log(
        "toTokenForecastslippage",
        toToken.chainId,
        toToken.symbol,
        toTokenForecastslippage
      );

      resolve(Math.max(fromTokenForecastslippage, toTokenForecastslippage));
    } catch (error) {
      resolve(0.31);
    }
  });
};

export function setupWidget() {
  InitSwapWidget({
    // crossChain: true,
    colorMode: "dark",
    apikey: "ef9apopzq9qrgntjubojbxe7hy4z5eez", // for default test
    getAutoSlippage,
  });
}