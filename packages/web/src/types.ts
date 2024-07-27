import type { GLOBAL_QUERIES } from 'src/screens';
import type { colorVars } from 'src/styles/colors';
import type { CSSVariables } from 'src/styles/variables';

export type MediaQueryStateShape = Record<keyof typeof GLOBAL_QUERIES, boolean>;

export interface FloatingRefStructure {
    readonly arrow: HTMLDivElement | null;
    readonly floating: HTMLDivElement | null;
}

export type CSSVariableKeys =
    | keyof typeof CSSVariables
    | keyof typeof colorVars;
