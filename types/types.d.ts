export type StepPoint = {
    name: string;
    x: number;
    y: number;
    linkedTo?: string[];
};

export type GridBox = {
    name: string;
    x: number;
    y: number;
    type: string;
};

export type Grid = {
    height: number;
    width: number;
    boxes: GridBox[];
};

export type BordoEventName = "mousemove" | "click" | "pointClick" | "boxClick";

export type MouseEventData = {
    percentage: { x: number; y: number };
    pixel: { x: number; y: number };
};

export type BordoCallback = (
    eventName: BordoEventName,
    data?: MouseEventData | MouseEvent
) => void;

export type BordoConfig<T extends "grid" | "steps"> = {
    element: HTMLElement;
    boxSize?: number;
    type: T;
    data: T extends "grid" ? Grid : StepPoint[];
    image?: string;
};

export type BordoProps<T extends "grid" | "steps"> = {
    config: Omit<BordoConfig<T>, "element">;
    on?: BordoCallback;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    id?: string;
};

export type BordoState = {
    points: StepPoint[];
    grid: Grid | null;
    mousePercent: { x: number; y: number };
    links: { from: string; to: string }[];
};
