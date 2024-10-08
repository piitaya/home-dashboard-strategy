import { AreaRegistryEntry } from "../ha/data/area_registry";

export const computeAreaPath = (area: AreaRegistryEntry) =>
  `areas-${area.area_id}`;
