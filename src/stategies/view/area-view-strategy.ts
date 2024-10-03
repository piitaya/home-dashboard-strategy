import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceBadgeConfig } from "../../ha/data/lovelace/config/badge";
import { LovelaceSectionConfig } from "../../ha/data/lovelace/config/section";
import { LovelaceViewConfig } from "../../ha/data/lovelace/config/view";
import { HomeAssistant } from "../../ha/types";
import { entityFilter, getEntityArea } from "../../helpers/entity";

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

    const entityIds = Object.keys(hass.states).filter((entityId) => {
      const areaId = getEntityArea(hass, entityId);
      const entity = hass.entities[entityId];
      if (entity?.entity_category || entity?.hidden) {
        return false;
      }
      return areaId === config.area;
    });

    const lightIds = entityIds.filter(entityFilter(hass, { domain: "light" }));

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

    const coverIds = entityIds.filter(entityFilter(hass, { domain: "cover" }));

    if (coverIds.length > 0) {
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

    const badges: LovelaceBadgeConfig[] = [];

    const temperatureSensorIds = entityIds.filter(
      entityFilter(hass, {
        domain: "sensor",
        device_class: "temperature",
      })
    );

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

    if (humiditySensorIds.length > 0) {
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

    const securityIds = entityIds.filter(
      entityFilter(hass, {
        domain: ["lock", "alarm_control_panel"],
      })
    );

    if (securityIds.length > 0) {
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

    const otherIds = entityIds.filter((entityId) => {
      return (
        !lightIds.includes(entityId) &&
        !coverIds.includes(entityId) &&
        !temperatureSensorIds.includes(entityId) &&
        !humiditySensorIds.includes(entityId) &&
        !mediaPlayerIds.includes(entityId) &&
        !securityIds.includes(entityId)
      );
    });

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
