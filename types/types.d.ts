export type StepPoint = {
    name: string;
    x: number;
    y: number;
    linkedTo?: string[];
};
export type GridBox = { name: string; x: number; y: number; type: string };
export type Grid = { height: number; width: number; boxes: GridBox[] };

export type BordoConfig<T extends "grid" | "steps"> = {
    boxSize?: number;
    type: T;
    data: T extends "grid" ? Grid : StepPoint[];
    image?: string;
};

export type BordoProps<T extends "grid" | "steps"> = {
    config: BordoConfig<T>;
    on?: (eventName: string, ...args: any[]) => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    id?: string;
};

export type BordoState = {
    points: StepPoint[];
    grid: Grid;
    mousePercent: { x: number; y: number };
    links: { from: string; to: string }[];
};
