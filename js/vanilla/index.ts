import type {
    BordoConfig,
    BordoCallback,
    BordoState,
    StepPoint,
} from "../../types/types";
import { STYLES, validateConfig, BordoCore } from "./core";

class BordoInstance<T extends "grid" | "steps"> {
    private config: BordoConfig<T>;
    private callback: BordoCallback;
    private state: BordoState;
    private pointMap: Map<string, StepPoint> = new Map();
    private boxMap: Map<string, any> = new Map();
    private eventListeners: Map<string, EventListener> = new Map();
    private svgContainer: SVGSVGElement | null = null;

    constructor(config: BordoConfig<T>, callback: BordoCallback) {
        validateConfig(config);

        this.config = config;
        this.callback = callback;
        this.state = {
            points: [],
            grid: null,
            mousePercent: { x: 0, y: 0 },
            links: [],
        };

        this.initialize();
    }

    private initialize(): void {
        if (this.config.type === "grid") {
            this.state.grid = this.config.data as any;
            // Build box lookup map for O(1) access
            this.state.grid!.boxes.forEach((box) => {
                this.boxMap.set(box.name, box);
            });
        }

        if (this.config.type === "steps") {
            this.state.points = this.config.data as StepPoint[];
            // Build point lookup map for O(1) access
            this.state.points.forEach((point) => {
                this.pointMap.set(point.name, point);
            });
        }

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const mousemove = (evt: MouseEvent) => {
            const position = BordoCore.calculateMousePosition(
                evt,
                this.config.element
            );

            this.callback("mousemove", {
                percentage: position,
                pixel: { x: evt.clientX, y: evt.clientY },
            });

            this.state.mousePercent = { x: position.x, y: position.y };
        };

        const click = (evt: MouseEvent) => {
            const target = evt.target as HTMLElement;

            if (target.classList.contains("point")) {
                this.callback("pointClick", evt);
            } else if (target.classList.contains("box")) {
                this.callback("boxClick", evt);
            } else {
                this.callback("click", evt);
            }
        };

        this.config.element.addEventListener("mousemove", mousemove);
        this.config.element.addEventListener("click", click);

        this.eventListeners.set("mousemove", (evt) => {
            mousemove(evt as MouseEvent);
        });

        this.eventListeners.set("click", (evt) => {
            click(evt as MouseEvent);
        });
    }

    private createPointElement(point: StepPoint): HTMLDivElement {
        const pointDiv = document.createElement("div");
        pointDiv.className = "point";
        pointDiv.dataset.name = point.name;
        pointDiv.style.cssText = STYLES.POINT;
        pointDiv.style.top = `${point.y}%`;
        pointDiv.style.left = `${point.x}%`;
        pointDiv.style.zIndex = "2";

        return pointDiv;
    }

    private createLinks(): void {
        if (!this.svgContainer) {
            this.svgContainer = BordoCore.createSVGElement();
            this.config.element.appendChild(this.svgContainer);
        }

        // Clear existing links
        while (this.svgContainer.firstChild) {
            this.svgContainer.removeChild(this.svgContainer.firstChild);
        }

        this.state.points.forEach((point) => {
            if (point.linkedTo && point.linkedTo.length > 0) {
                point.linkedTo.forEach((linkedToName) => {
                    const linkedPoint = this.pointMap.get(linkedToName);
                    if (linkedPoint) {
                        const line = BordoCore.createLine(
                            point.x,
                            point.y,
                            linkedPoint.x,
                            linkedPoint.y
                        );
                        this.svgContainer!.appendChild(line);
                    }
                });
            }
        });
    }

    private renderSteps(): void {
        // Create points
        const fragment = document.createDocumentFragment();

        this.state.points.forEach((point) => {
            const pointElement = this.createPointElement(point);
            fragment.appendChild(pointElement);
        });

        this.config.element.appendChild(fragment);

        // Create links
        this.createLinks();
    }

    private renderGrid(): void {
        if (!this.state.grid) return;

        const mainDiv = document.createElement("div");
        mainDiv.style.cssText = STYLES.GRID_CONTAINER;

        const boxSize = this.config.boxSize || 50;

        for (let i = 0; i < this.state.grid.height; i++) {
            const columnDiv = document.createElement("div");
            columnDiv.style.cssText = STYLES.GRID_COLUMN;

            for (let j = 0; j < this.state.grid.width; j++) {
                const boxName = `${i}-${j}`;
                const box = this.boxMap.get(boxName);

                const rowDiv = document.createElement("div");
                rowDiv.className = "box";
                rowDiv.dataset.name = boxName;
                rowDiv.style.cssText = STYLES.BOX;
                rowDiv.style.width = `${boxSize}px`;
                rowDiv.style.height = `${boxSize}px`;

                if (box) {
                    rowDiv.dataset.type = box.type;
                    // Add visual styling based on box type
                    if (box.type === "filled") {
                        rowDiv.style.backgroundColor = "#000";
                    } else {
                        rowDiv.style.border = "1px solid #ccc";
                    }
                }

                columnDiv.appendChild(rowDiv);
            }

            mainDiv.appendChild(columnDiv);
        }

        this.config.element.appendChild(mainDiv);
    }

    public render(): () => void {
        // Set background styles
        this.config.element.style.cssText = STYLES.BACKGROUND(
            this.config.image
        );

        if (this.config.type === "steps") {
            this.renderSteps();
        } else if (this.config.type === "grid") {
            this.renderGrid();
        }

        // Return cleanup function
        return () => this.cleanup();
    }

    private cleanup(): void {
        // Remove event listeners
        this.eventListeners.forEach((listener, event) => {
            this.config.element.removeEventListener(event, listener);
        });
        this.eventListeners.clear();

        // Clear DOM efficiently
        while (this.config.element.firstChild) {
            this.config.element.removeChild(this.config.element.firstChild);
        }

        // Clear state
        this.state.points = [];
        this.state.grid = null;
        this.pointMap.clear();
        this.boxMap.clear();
        this.svgContainer = null;
    }

    public updateData(data: T extends "grid" ? any : StepPoint[]): void {
        // Clear current render
        while (this.config.element.firstChild) {
            this.config.element.removeChild(this.config.element.firstChild);
        }

        // Update data
        this.config.data = data;
        this.initialize();
        this.render();
    }

    public getState(): BordoState {
        return { ...this.state };
    }
}

// Main Bordo function
export const Bordo = <T extends "grid" | "steps">(
    config: BordoConfig<T>,
    callback: BordoCallback = () => {}
): (() => void) => {
    const instance = new BordoInstance(config, callback);
    return instance.render();
};

export default Bordo;
