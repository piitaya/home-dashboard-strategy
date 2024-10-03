import type { LovelaceStrategyConfig } from "./strategy";
import type { LovelaceViewRawConfig } from "./view";

export interface LovelaceDashboardBaseConfig {}

export interface LovelaceConfig extends LovelaceDashboardBaseConfig {
  background?: string;
  views: LovelaceViewRawConfig[];
}

export interface LovelaceDashboardStrategyConfig
  extends LovelaceDashboardBaseConfig {
  strategy: LovelaceStrategyConfig;
}

export type LovelaceRawConfig =
  | LovelaceConfig
  | LovelaceDashboardStrategyConfig;
