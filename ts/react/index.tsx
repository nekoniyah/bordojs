import React, { Component, type JSX } from "react";
import { type MouseEvent } from "react";
import styled from "styled-components";
import type { BordoEventName, BordoProps, BordoState, Grid, StepPoint } from "../../types/types";

// Pre-define styled components outside the class to avoid recreation
const BaseMainDiv = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

const MainDivWithImage = styled(BaseMainDiv) <{ backgroundImage?: string }>`
    background-image: url(${props => props.backgroundImage});
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
`;

const GridContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 0;
`;

// Pre-defined styled components for grid elements
const GridColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
`;

const GridRow = styled.div<{ boxSize: number }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: ${props => props.boxSize}px;
    height: ${props => props.boxSize}px;
    pointer-events: all;
    gap: 0;
`;

export class Bordo<T extends "grid" | "steps"> extends Component<
    BordoProps<T>,
    BordoState
> {
    private listeners: ((eventName: string, ...args: any[]) => void)[] = [];
    private boxLookupMap: Map<string, any> = new Map(); // Cache for O(1) box lookups
    private memoizedGridElements: JSX.Element[] | null = null;
    private lastGridConfig: string | null = null;

    constructor(props: BordoProps<T>) {
        super(props);

        // Ensure boxSize has a default value (faithful to original)
        if (!this.props.config.boxSize) this.props.config.boxSize = 50;

        this.state = {
            points: [],
            grid: {
                height: 0,
                width: 0,
                boxes: [],
            },
            mousePercent: { x: 0, y: 0 },
            links: [],
        };

        // Bind methods once in constructor (faithful to original)
        this.mousemove = this.mousemove.bind(this);
        this.pointClick = this.pointClick.bind(this);
        this.boxClick = this.boxClick.bind(this);
    }

    emit(eventName: string, ...args: any[]) {
        if (this.props.on) this.props.on(eventName as BordoEventName, ...args);
        this.listeners.forEach((listener) => listener(eventName, ...args));
    }

    addListener(listener: (eventName: string, ...args: any[]) => void) {
        this.listeners.push(listener);
    }

    override componentDidMount() {
        this.updateFromConfig();
    }

    override componentDidUpdate(prevProps: BordoProps<T>) {
        if (prevProps.config !== this.props.config) {
            this.updateFromConfig();
            // Clear memoized grid when config changes
            this.memoizedGridElements = null;
            this.lastGridConfig = null;
        }
    }

    updateFromConfig() {
        const { config } = this.props;

        if (config.type === "grid") {
            const grid = config.data as Grid;
            this.setState({ grid });

            // Build lookup map for O(1) access instead of O(n) find operations
            this.boxLookupMap.clear();
            grid.boxes.forEach(box => {
                this.boxLookupMap.set(box.name, box);
            });
        } else if (config.type === "steps") {
            const points = config.data as StepPoint[];
            const links: { from: string; to: string }[] = [];

            points.forEach((point) => {
                if (point.linkedTo) {
                    point.linkedTo.forEach((linkedTo) => {
                        links.push({ from: point.name, to: linkedTo });
                    });
                }
            });

            this.setState({ points, links });
        }
    }

    mousemove(ev: MouseEvent<HTMLDivElement>) {
        // Fixed: Use currentTarget instead of target (faithful to original logic)
        const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((ev.pageX - rect.left) / rect.width) * 100;
        const y = ((ev.pageY - rect.top) / rect.height) * 100;

        this.emit("mousemove", {
            percentage: { x, y },
            pixel: { x: ev.clientX, y: ev.clientY },
        });

        // Keep original calculation (x * 100, y * 100) - this might be intentional
        this.setState({ mousePercent: { x: x * 100, y: y * 100 } });
    }

    pointClick(ev: MouseEvent<HTMLDivElement>) {
        // Faithful to original - emits "click" not "pointClick"
        this.emit("click", ev);
    }

    boxClick(ev: MouseEvent<HTMLDivElement>) {
        // Faithful to original - emits "click" not "boxClick"
        this.emit("click", ev);
    }

    generateGridElements() {
        const { config } = this.props;
        if (config.type !== "grid") return [];

        // Memoization optimization while keeping original structure
        const configKey = JSON.stringify({
            type: config.type,
            data: config.data,
            boxSize: config.boxSize
        });

        if (this.memoizedGridElements && this.lastGridConfig === configKey) {
            return this.memoizedGridElements;
        }

        let elements: JSX.Element[] = [];
        let c = config.data as Grid;

        for (let i = 0; i < c.height; i++) {
            let rows: JSX.Element[] = [];

            for (let j = 0; j < c.width; j++) {
                // Optimized: Use Map lookup instead of find for O(1) performance
                const box = this.boxLookupMap.get(`${i}-${j}`);

                if (box) {
                    rows.push(
                        <GridRow
                            key={j}
                            id={box.name}
                            boxSize={config.boxSize!}
                        />
                    );
                }
            }

            elements.push(
                <GridColumn key={i}>
                    {rows}
                </GridColumn>
            );
        }

        // Cache the result
        this.memoizedGridElements = elements;
        this.lastGridConfig = configKey;

        return elements;
    }

    override render() {
        const { config } = this.props;
        const { points } = this.state;

        // Faithful to original conditional styling approach
        const Main = config.image ? MainDivWithImage : BaseMainDiv;
        return (
            <Main
                onMouseMove={this.mousemove}
                id={this.props.id}
                className={this.props.className}
                style={this.props.style}
                backgroundImage={config.image}

            >
                {config.type === "steps" &&
                    points.map((point) => (
                        <div
                            key={point.name}
                            style={{
                                position: "absolute",
                                width: `${config.boxSize}px`,
                                height: `${config.boxSize}px`,
                                left: `calc(${point.x}% - ${config.boxSize! / 2}px)`,
                                top: `calc(${point.y}% - ${config.boxSize! / 2}px)`,
                                borderRadius: "50%",
                                zIndex: 3,
                                cursor: "pointer",
                                pointerEvents: "all",
                            }}
                            id={point.name}
                            onClick={(ev) => this.pointClick(ev)}
                        />
                    ))}
                {config.type === "grid" && (
                    <GridContainer id="grid">
                        {this.generateGridElements().map((element, index) => (
                            <div key={index} onClick={(ev: any) => this.boxClick(ev)}>
                                {element}
                            </div>
                        ))}
                    </GridContainer>
                )}
            </Main>
        );
    }
}

export default Bordo;

// Keep original exports
export type BordoMode = "draw" | "link" | "drag" | "none";
export type BordoType = "grid" | "steps";