import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";

export type AreaViewStrategyConfig = {
  area?: string;
};

@customElement("ll-strategy-view-physaroom-area")
export class AreaViewStrategy extends ReactiveElement {
  static async generate(
    config: AreaViewStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceViewConfig> {
    if (!config.area) {
      throw new Error("Area not provided");
    }

    const area = hass.areas[config.area];

    if (!area) {
      throw new Error("Unknown area");
    }

    return {
      type: "sections",
      sections: [
        {
          type: "grid",
          cards: [
            {
              type: "area",
              area: area.area_id,
            },
          ],
        },
      ],
    };
  }
}
