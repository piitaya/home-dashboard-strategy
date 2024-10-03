import type { LovelaceCardConfig } from "./card";
import { Condition } from "./condition";
import type { LovelaceStrategyConfig } from "./strategy";

export interface LovelaceBaseSectionConfig {
  visibility?: Condition[];
  column_span?: number;
  row_span?: number;
}

export interface LovelaceSectionConfig extends LovelaceBaseSectionConfig {
  type?: string;
  cards?: LovelaceCardConfig[];
}

export interface LovelaceStrategySectionConfig
  extends LovelaceBaseSectionConfig {
  strategy: LovelaceStrategyConfig;
}

export type LovelaceSectionRawConfig =
  | LovelaceSectionConfig
  | LovelaceStrategySectionConfig;
