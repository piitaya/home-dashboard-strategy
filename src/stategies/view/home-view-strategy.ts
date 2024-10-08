import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import {
  LovelaceStrategyViewConfig,
  LovelaceViewConfig,
} from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";
import { LovelaceSectionConfig } from "../../ha/data/lovelace/config/section";
import { computeDomain } from "../../ha/common/entity";
import {
  entityFilter,
  getEntityArea,
  HIDDEN_DOMAIN,
} from "../../helpers/entity";
import { computeAreaPath } from "../../helpers/area";

export type HomeViewStrategyConfig = {};

@customElement("ll-strategy-view-physaroom-home")
export class HomeViewStrategy extends ReactiveElement {
  static async generate(
    _config: HomeViewStrategyConfig,
    hass: HomeAssistant
  ): Promise<LovelaceViewConfig> {
    let entityIds = Object.keys(hass.states).filter((entityId) => {
      const domain = computeDomain(entityId);
      if (HIDDEN_DOMAIN.has(domain)) {
        return false;
      }
      const entity = hass.entities[entityId];
      if (entity?.entity_category || entity?.hidden) {
        return false;
      }
      return true;
    });

    const areas = Object.values(hass.areas).sort((a, b) => {
      const floorA = a.floor_id ? hass.floors[a.floor_id] : null;
      const floorB = b.floor_id ? hass.floors[b.floor_id] : null;
      return -1 * ((floorB?.level ?? Infinity) - (floorA?.level ?? Infinity));
    });

    const areaSections = areas.map<LovelaceSectionConfig>((area) => {
      const areaEntityIds = entityIds.filter((entityId) => {
        const areaId = getEntityArea(hass, entityId);
        return areaId === area.area_id;
      });

      const temperatureSensorId = areaEntityIds.find(
        entityFilter(hass, { domain: "sensor", device_class: "temperature" })
      );
      const humidiySensorId = areaEntityIds.find(
        entityFilter(hass, { domain: "sensor", device_class: "humidity" })
      );

      return {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: area.name,
            icon: area.icon || undefined,
            badges: [
              ...(temperatureSensorId ? [{ entity: temperatureSensorId }] : []),
              ...(humidiySensorId ? [{ entity: humidiySensorId }] : []),
            ],
            tap_action: {
              action: "navigate",
              navigation_path: computeAreaPath(area),
            },
          },
          {
            type: "area",
            area: area.area_id,
            navigation_path: computeAreaPath(area),
            alert_classes: [],
            sensor_classes: [],
          },
        ],
      };
    });

    return {
      type: "sections",
      max_columns: 3,
      sections: [...areaSections],
    };
  }
}
