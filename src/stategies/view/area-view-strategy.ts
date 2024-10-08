import { ReactiveElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { computeDomain } from "../../ha/common/entity";
import { LovelaceBadgeConfig } from "../../ha/data/lovelace/config/badge";
import { LovelaceSectionConfig } from "../../ha/data/lovelace/config/section";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";
import {
  entityFilter,
  getEntityArea,
  HIDDEN_DOMAIN,
} from "../../helpers/entity";
import { arrayDiff } from "../../common/array";
import { lightSupportsBrightness } from "../../ha/data/light";
import { supportsFeature } from "../../ha/common/entity/supports-feature";
import { CoverEntityFeature } from "../../ha/data/cover";

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
    entityIds = arrayDiff(entityIds, temperatureSensorIds);

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
    entityIds = arrayDiff(entityIds, humiditySensorIds);

    if (humiditySensorIds.length > 0) {
      badges.push(
        ...humiditySensorIds.map((entityId) => ({
          type: "entity",
          entity: entityId,
          color: "purple",
        }))
      );
    }

    const presenceSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "binary_sensor",
        device_class: ["motion", "occupancy", "presence"],
      })
    );
    entityIds = arrayDiff(entityIds, presenceSensorIds);

    if (presenceSensorIds.length > 0) {
      badges.push(
        ...presenceSensorIds.map((entityId) => ({
          type: "entity",
          entity: entityId,
        }))
      );
    }

    // Lights section
    const lightIds = entityIds.filter(entityFilter(hass, { domain: "light" }));
    entityIds = arrayDiff(entityIds, lightIds);

    if (lightIds.length > 0) {
      sections.push({
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Lights",
            icon: "mdi:lamps",
          },
          ...lightIds.map((entityId) => {
            const stateObj = hass.states[entityId];
            const supportsBrightness = lightSupportsBrightness(stateObj);
            return {
              type: "tile",
              entity: entityId,
              ...(supportsBrightness
                ? { features: [{ type: "light-brightness" }] }
                : {}),
            };
          }),
        ],
      });
    }

    // Climate section
    const climateIds = entityIds.filter(
      entityFilter(hass, { domain: ["climate", "humidifier"] })
    );
    entityIds = arrayDiff(entityIds, climateIds);

    const shutterIds = entityIds.filter(
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
    entityIds = arrayDiff(entityIds, shutterIds);

    const windowSensorIds = entityIds.filter(
      entityFilter(hass, { domain: "binary_sensor", device_class: "window" })
    );
    entityIds = arrayDiff(entityIds, windowSensorIds);

    if (
      shutterIds.length > 0 ||
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
          ...(shutterIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Shutters",
                  heading_style: "subtitle",
                  icon: "mdi:window-shutter",
                },
              ]
            : []),
          ...shutterIds.map((entityId) => {
            const stateObj = hass.states[entityId];
            const supportsOpenClose = supportsFeature(
              stateObj,
              CoverEntityFeature.OPEN || CoverEntityFeature.CLOSE
            );
            const supportsTilt = supportsFeature(
              stateObj,
              CoverEntityFeature.OPEN_TILT || CoverEntityFeature.CLOSE_TILT
            );
            return {
              type: "tile",
              entity: entityId,
              features: supportsOpenClose
                ? [{ type: "cover-open-close" }]
                : supportsTilt
                ? [{ type: "cover-tilt" }]
                : [],
            };
          }),
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
    entityIds = arrayDiff(entityIds, mediaPlayerIds);

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
    entityIds = arrayDiff(entityIds, securityIds);

    const doorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["cover"],
        device_class: ["door", "garage", "gate"],
      })
    );
    entityIds = arrayDiff(entityIds, doorIds);

    const doorSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["binary_sensor"],
        device_class: ["door", "garage_door"],
      })
    );
    entityIds = arrayDiff(entityIds, doorSensorIds);

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
          ...doorIds.map((entityId) => ({
            type: "tile",
            entity: entityId,
          })),
          ...(doorSensorIds.length > 0
            ? [
                {
                  type: "heading",
                  heading: "Sensors",
                  heading_style: "subtitle",
                  icon: "mdi:wifi",
                },
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
    entityIds = arrayDiff(entityIds, powerSensorIds);

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
          {
            type: "history-graph",
            entities: powerSensorIds,
            hours_to_show: 6,
          },
        ],
      });
    }

    const energySensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: ["energy"],
      })
    );
    // Only hide them, do not show them in a section
    entityIds = arrayDiff(entityIds, energySensorIds);

    // Other sensors
    const otherSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["sensor", "binary_sensor"],
      })
    );
    entityIds = arrayDiff(entityIds, otherSensorIds);

    if (otherSensorIds.length > 0) {
      sections.push({
        type: "grid",
        column_span: 3,
        cards: [
          {
            type: "heading",
            heading: "Sensors",
            icon: "mdi:memory",
          },
          ...otherSensorIds.map((entityId) => {
            const domain = computeDomain(entityId);
            if (domain === "sensor") {
              return {
                type: "sensor",
                entity: entityId,
                graph: "line",
              };
            }
            return {
              type: "entity",
              entity: entityId,
            };
          }),
        ],
      });
    }

    // Others
    const otherIds = entityIds;

    if (otherIds.length > 0) {
      sections.push({
        type: "grid",
        column_span: 3,
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
      max_columns: 3,
      badges: badges,
      sections: sections,
    };
  }
}
