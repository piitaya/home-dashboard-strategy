import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";

export type HomeViewStrategyConfig = {};

@customElement("ll-strategy-view-physaroom-home")
export class HomeViewStrategy extends ReactiveElement {
  static async generate(
    _config: HomeViewStrategyConfig
  ): Promise<LovelaceViewConfig> {
    return {
      type: "sections",
      sections: [
        {
          type: "grid",
          cards: [
            {
              type: "markdown",
              content: "Hi {{ user }} 👋 Welcome to your home. 🏡",
            },
          ],
        },
      ],
    };
  }
}
