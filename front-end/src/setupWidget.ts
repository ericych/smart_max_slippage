import { InitSwapWidget } from "@dodoex/widgets";
import type { SwapWidgetProps } from "@dodoex/widgets";

const getAutoSlippage: SwapWidgetProps["getAutoSlippage"] = ({
  fromToken,
  toToken,
}) => {
  if (!fromToken || !toToken || fromToken.chainId !== toToken.chainId)
    return undefined;

  /** TODO: Edit this. */
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0.3);
    }, 500);
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