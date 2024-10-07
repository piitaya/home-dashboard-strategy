import { HassEntity } from "home-assistant-js-websocket";
import { ensureArray } from "../ha/common/array/ensure-array";
import { computeDomain } from "../ha/common/entity";
import { HomeAssistant } from "../ha/types";

export const ASSIST_DOMAIN = ["assist_satellite", "conversation", "stt", "tts"];

export const HIDDEN_DOMAIN = new Set([
  "automation",
  "configurator",
  "device_tracker",
  "event",
  "geo_location",
  "notify",
  "persistent_notification",
  "script",
  "sun",
  "tag",
  "todo",
  "zone",
  ...ASSIST_DOMAIN,
]);

export const getEntityArea = (hass: HomeAssistant, entityId: string) => {
  const entity = hass.entities[entityId];
  if (!entity) {
    return null;
  }
  if (entity.area_id) {
    return entity.area_id;
  }
  const device = entity.device_id ? hass.devices[entity.device_id] : null;
  if (device && device.area_id) {
    return device.area_id;
  }
  return null;
};

type EntityFilter = {
  domain?: string | string[];
  device_class?: string | string[];
};

export const entityFilter = (hass: HomeAssistant, filter: EntityFilter) => {
  const domains = ensureArray(filter.domain) ?? [];
  const deviceClasses = ensureArray(filter.device_class) ?? [];
  return (entityId: string) => {
    if (domains.length > 0) {
      const domain = computeDomain(entityId);
      if (!domains.includes(domain)) {
        return false;
      }
    }
    if (deviceClasses.length > 0) {
      const stateObj = hass.states[entityId] as HassEntity | undefined;
      const dc = stateObj?.attributes.device_class;
      if (!dc) {
        return false;
      }
      const deviceClasses = ensureArray(filter.device_class);
      if (!deviceClasses.includes(dc)) {
        return false;
      }
    }
    return true;
  };
};

export const excludeIds = (ids: string[]) => (entityId: string) =>
  !ids.includes(entityId);
