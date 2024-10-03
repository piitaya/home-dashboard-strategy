import { Condition } from "./condition";
import { LovelaceLayoutOptions } from "./layout_options";

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  layout_options?: LovelaceLayoutOptions;
  type: string;
  [key: string]: any;
  visibility?: Condition[];
}
