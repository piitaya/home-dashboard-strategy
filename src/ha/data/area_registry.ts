import { RegistryEntry } from "./registry";

export interface AreaRegistryEntry extends RegistryEntry {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}
