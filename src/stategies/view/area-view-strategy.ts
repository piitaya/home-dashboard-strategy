import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { computeDomain } from "../../ha/common/entity";
import { LovelaceBadgeConfig } from "../../ha/data/lovelace/config/badge";
import { LovelaceSectionConfig } from "../../ha/data/lovelace/config/section";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";
import {
  entityFilter,
  excludeEntityIds,
  getEntityArea,
  HIDDEN_DOMAIN,
} from "../../helpers/entity";

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

    // Badges
    const temperatureSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: "temperature",
      })
    );
    entityIds = excludeEntityIds(entityIds, temperatureSensorIds);

    if (temperatureSensorIds.length > 0) {
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
        domain: "sensor",
        device_class: "humidity",
      })
    );
    entityIds = excludeEntityIds(entityIds, humiditySensorIds);

    if (humiditySensorIds.length > 0) {
      badges.push(
        ...humiditySensorIds.map((entityId) => ({
          type: "entity",
          entity: entityId,
          color: "purple",
        }))
      );
    }

    // Lights section
    const lightIds = entityIds.filter(entityFilter(hass, { domain: "light" }));
    entityIds = excludeEntityIds(entityIds, lightIds);

    if (lightIds.length > 0) {
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

    // Climate section
    const coverIds = entityIds.filter(
      entityFilter(hass, {
        domain: "cover",
        device_class: [
          "shutter",
          "awning",
          "blind",
          "curtain",
          "shade",
          "shutter",
          "window",
        ],
      })
    );
    entityIds = excludeEntityIds(entityIds, coverIds);

    const climateIds = entityIds.filter(
      entityFilter(hass, { domain: ["climate", "humidifier"] })
    );
    entityIds = excludeEntityIds(entityIds, climateIds);

    const windowSensorIds = entityIds.filter(
      entityFilter(hass, { domain: "binary_sensor", device_class: "window" })
    );
    entityIds = excludeEntityIds(entityIds, windowSensorIds);

    if (
      coverIds.length > 0 ||
      climateIds.length > 0 ||
      windowSensorIds.length > 0
    ) {
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Climate",
            icon: "mdi:home-thermometer",
          },
          ...(coverIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Shutters",
                  heading_style: "subtitle",
                  icon: "mdi:window-shutter",
                },
              ]
            : []),
          ...coverIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
          ...(climateIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Thermostat and humidifier",
                  heading_style: "subtitle",
                  icon: "mdi:thermostat",
                },
              ]
            : []),
          ...climateIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
          ...(windowSensorIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Sensors",
                  heading_style: "subtitle",
                  icon: "mdi:window-open",
                },
              ]
            : []),
          ...windowSensorIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    // Entertainment section
    const mediaPlayerIds = entityIds.filter(
      entityFilter(hass, {
        domain: "media_player",
      })
    );
    entityIds = excludeEntityIds(entityIds, mediaPlayerIds);

    if (mediaPlayerIds.length > 0) {
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Entertainment",
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

    // Security section
    const securityIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["lock", "alarm_control_panel"],
      })
    );
    entityIds = excludeEntityIds(entityIds, securityIds);

    const doorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["cover"],
        device_class: ["door", "garage", "gate"],
      })
    );
    entityIds = excludeEntityIds(entityIds, doorIds);

    const doorSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["binary_sensor"],
        device_class: ["door", "garage_door"],
      })
    );
    entityIds = excludeEntityIds(entityIds, doorSensorIds);

    if (
      securityIds.length > 0 ||
      doorIds.length > 0 ||
      doorSensorIds.length > 0
    ) {
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Security",
            icon: "mdi:shield",
          },
          ...(securityIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Alarm and locks",
                  heading_style: "subtitle",
                  icon: "mdi:alarm-light",
                },
              ]
            : []),
          ...securityIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
          ...(doorIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Doors",
                  heading_style: "subtitle",
                  icon: "mdi:door",
                },
              ]
            : []),
          ...(doorSensorIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Sensors",
                  heading_style: "subtitle",
                  icon: "mdi:wifi",
                },
                ...doorSensorIds.map((entityId) => ({
                  type: "tile",
                  entity: entityId,
                })),
              ]
            : []),
          ...doorSensorIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
        ],
      });
    }

    // Power section
    const powerSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: ["power"],
      })
    );
    entityIds = excludeEntityIds(entityIds, lightIds);

    if (powerSensorIds.length > 0) {
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
    entityIds = excludeEntityIds(entityIds, powerSensorIds);

    const energySensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: ["energy"],
      })
    );
    // Only hide them, do not show them in a section
    entityIds = excludeEntityIds(entityIds, energySensorIds);

    // Other sensors
    const otherSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["sensor", "binary_sensor"],
      })
    );
    entityIds = excludeEntityIds(entityIds, otherSensorIds);

    if (otherSensorIds.length > 0) {
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

    // Others
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
