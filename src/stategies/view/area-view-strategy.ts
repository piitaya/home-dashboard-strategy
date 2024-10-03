import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";

export type AreaViewStrategyConfig = {};

@customElement("ll-strategy-view-physaroom-area")
export class AreaViewStrategy extends ReactiveElement {
  static async generate(
    _config: AreaViewStrategyConfig
  ): Promise<LovelaceViewConfig> {
    return {
      badges: [],
      sections: [],
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ll-strategy-view-physaroom-area": AreaViewStrategy;
  }
}
