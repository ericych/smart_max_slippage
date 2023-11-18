import { setupWidget } from "./setupWidget.ts";

document.querySelector<HTMLDivElement>(
  "#app"
)!.innerHTML = `<div id="dodo-swap-widget"></div>`;

setupWidget();