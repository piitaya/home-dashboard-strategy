import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceConfig } from "../../ha/data/lovelace/config/types";

export type MainDashboardStrategyConfig = {};

@customElement("ll-strategy-dashboard-physaroom")
export class MainDashboardStrategy extends ReactiveElement {
  static async generate(
    _config: MainDashboardStrategy
  ): Promise<LovelaceConfig> {
    return {
      views: [
        {
          title: "Physaroom",
          type: "sections",
          sections: [
            {
              type: "grid",
              cards: [
                {
                  type: "markdown",
                  content: "Welcome Home 👋",
                },
              ],
            },
          ],
        },
      ],
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ll-strategy-dashboard-physaroom": MainDashboardStrategy;
  }
}
