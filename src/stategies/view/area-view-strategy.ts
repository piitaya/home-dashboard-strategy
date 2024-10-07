import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceBadgeConfig } from "../../ha/data/lovelace/config/badge";
import { LovelaceSectionConfig } from "../../ha/data/lovelace/config/section";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";
import {
  entityFilter,
  excludeIds,
  getEntityArea,
  HIDDEN_DOMAIN,
} from "../../helpers/entity";
import { computeDomain } from "../../ha/common/entity";

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

    const sections: LovelaceSectionConfig[] = [];
    const badges: LovelaceBadgeConfig[] = [];

    let entityIds = Object.keys(hass.states).filter((entityId) => {
      const domain = computeDomain(entityId);
      if (HIDDEN_DOMAIN.has(domain)) {
        return false;
      }
      const entity = hass.entities[entityId];
      if (entity?.entity_category || entity?.hidden) {
        return false;
      }
      const areaId = getEntityArea(hass, entityId);
      return areaId === config.area;
    });

    const lightIds = entityIds.filter(entityFilter(hass, { domain: "light" }));

    if (lightIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(lightIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Lights",
            icon: "mdi:lamps",
          },
          ...lightIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const coverIds = entityIds.filter(entityFilter(hass, { domain: "cover" }));

    if (coverIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(coverIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Cover",
            icon: "mdi:window-shutter",
          },
          ...coverIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const temperatureSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: "temperature",
      })
    );

    if (temperatureSensorIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(temperatureSensorIds));
      badges.push(
        ...temperatureSensorIds.map((entityId) => ({
          type: "entity",
          entity: entityId,
          color: "red",
        }))
      );
    }

    const humiditySensorIds = entityIds.filter(
      entityFilter(hass, {
        device_class: "humidity",
      })
    );

    if (humiditySensorIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(humiditySensorIds));
      badges.push(
        ...humiditySensorIds.map((entityId) => ({
          type: "entity",
          entity: entityId,
          color: "purple",
        }))
      );
    }

    const mediaPlayerIds = entityIds.filter(
      entityFilter(hass, {
        domain: "media_player",
      })
    );

    if (mediaPlayerIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(mediaPlayerIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Media players",
            icon: "mdi:multimedia",
          },
          ...mediaPlayerIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
            show_entity_picture: true,
          })),
        ],
      });
    }

    const climateIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["climate", "humidifier"],
      })
    );

    if (climateIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(climateIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Climate",
            icon: "mdi:thermostat",
          },
          ...climateIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const securityIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["lock", "alarm_control_panel"],
      })
    );

    if (securityIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(securityIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Security",
            icon: "mdi:shield",
          },
          ...securityIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const powerSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: ["power"],
      })
    );

    if (powerSensorIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(powerSensorIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Power",
            icon: "mdi:lightning-bolt",
            tap_action: {
              action: "navigate",
              navigation_path: "/energy",
            },
          },
          ...powerSensorIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const energySensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: ["energy"],
      })
    );

    if (energySensorIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(energySensorIds));
      // Only hide them, do not show them in a section
    }

    const otherSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["sensor", "binary_sensor"],
      })
    );

    if (otherSensorIds.length > 0) {
      entityIds = entityIds.filter(excludeIds(otherSensorIds));
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Sensors",
            icon: "mdi:memory",
          },
          ...otherSensorIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    const otherIds = entityIds;

    if (otherIds.length > 0) {
      sections.push({
        type: "grid",
        column_span: 4,
        cards: [
          {
            type: "heading",
            heading: "Other",
            icon: "mdi:file",
          },
          ...otherIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    return {
      type: "sections",
      badges: badges,
      sections: sections,
    };
  }
}
