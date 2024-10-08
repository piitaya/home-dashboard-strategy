import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceConfig } from "../../ha/data/lovelace/config/types";
import { HomeAssistant } from "../../ha/types";
import { LovelaceStrategyViewConfig } from "../../ha/data/lovelace/config/view";
import { computeAreaPath } from "../../helpers/area";

export type DashboardStrategyConfig = {};

@customElement("ll-strategy-dashboard-physaroom")
export class DashboardStrategy extends ReactiveElement {
  static async generate(
    _config: DashboardStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceConfig> {
    const area = Object.values(hass.areas);

    const areaViews = area.map<LovelaceStrategyViewConfig>((area) => ({
      title: area.name,
      icon: area.icon || undefined,
      path: computeAreaPath(area),
      subview: true,
      strategy: {
        type: "custom:physaroom-area",
        area: area.area_id,
      },
    }));

    return {
      views: [
        {
          title: "Home",
          icon: "mdi:home",
          path: "home",
          strategy: {
            type: "custom:physaroom-home",
          },
        },
        ...areaViews,
      ],
    };
  }
}
