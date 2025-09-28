import type { BordoConfig, StepPoint } from "../../types/types";

// Style constants
export const STYLES = {
    POINT: `
        position: absolute;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 20px solid #000;
        cursor: pointer;
        pointer-events: all;
    `,
    GRID_CONTAINER: `
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 0;
    `,
    GRID_COLUMN: `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
    `,
    BOX: `
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        pointer-events: all;
        gap: 0;
        cursor: pointer;
    `,
    BACKGROUND: (image?: string) => `
        ${image ? `background-image: url(${image});` : ""}
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
        position: relative;
    `,
};

// Validation utilities
export const validateConfig = <T extends "grid" | "steps">(
    config: BordoConfig<T>
): boolean => {
    if (!config.element) throw new Error("Element is required");
    if (!config.type) throw new Error("Type is required");
    if (!config.data) throw new Error("Data is required");

    if (config.type === "grid") {
        const grid = config.data as any;
        if (!grid.height || !grid.width || !Array.isArray(grid.boxes)) {
            throw new Error("Invalid grid data structure");
        }
    }

    if (config.type === "steps") {
        const points = config.data as StepPoint[];
        if (!Array.isArray(points)) {
            throw new Error("Steps data must be an array");
        }
        points.forEach((point, index) => {
            if (
                !point.name ||
                typeof point.x !== "number" ||
                typeof point.y !== "number"
            ) {
                throw new Error(`Invalid point at index ${index}`);
            }
        });
    }

    return true;
};

// Core utilities
export const BordoCore = {
    calculateMousePosition: (ev: MouseEvent, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return {
            x: ((ev.pageX - rect.left) / rect.width) * 100,
            y: ((ev.pageY - rect.top) / rect.height) * 100,
        };
    },

    createSVGElement: (
        width: string = "100%",
        height: string = "100%"
    ): SVGSVGElement => {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("pointer-events", "none");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.zIndex = "1";
        return svg;
    },

    createLine: (
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): SVGLineElement => {
        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );
        line.setAttribute("x1", `${x1}%`);
        line.setAttribute("y1", `${y1}%`);
        line.setAttribute("x2", `${x2}%`);
        line.setAttribute("y2", `${y2}%`);
        line.setAttribute("stroke", "#000");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("pointer-events", "none");
        return line;
    },
};
