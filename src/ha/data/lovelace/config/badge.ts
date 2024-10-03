import { Condition } from "./condition";

export interface LovelaceBadgeConfig {
  type: string;
  [key: string]: any;
  visibility?: Condition[];
}
