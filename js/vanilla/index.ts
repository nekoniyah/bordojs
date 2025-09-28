import type {
    BordoConfig,
    BordoState,
    Grid,
    StepPoint,
} from "../../types/types";

const Bordo = function <T extends "steps" | "grid">(
    config: BordoConfig<T> & { element: HTMLDivElement },
    callback: (eventName: string, ...args: any[]) => void
) {
    const state: BordoState = {
        points: [],
        grid: {
            height: 0,
            width: 0,
            boxes: [],
        },
        mousePercent: { x: 0, y: 0 },
        links: [],
    };

    if (config.type === "grid") state.grid = config.data as Grid;
    if (config.type === "steps") state.points = config.data as StepPoint[];

    const mousemove = (ev: MouseEvent) => {
        const rect = (ev.target as HTMLDivElement).getBoundingClientRect();
        const x = ((ev.pageX - rect.left) / rect.width) * 100;
        const y = ((ev.pageY - rect.top) / rect.height) * 100;

        callback("mousemove", {
            percentage: { x, y },
            pixel: { x: ev.clientX, y: ev.clientY },
        });

        state.mousePercent = { x: x * 100, y: y * 100 };
    };

    config.element.addEventListener("mousemove", mousemove);

    return () => {
        config.element.removeEventListener("mousemove", mousemove);
        config.element.innerHTML = "";

        const { points } = state;
        // Setting main styles to the div element

        config.element.style = `${
            config.image ? `background-image: url(${config.image});` : ""
        } 
                background-size: contain;
                background-position: center center;
                background-repeat: no-repeat;
                width: 100%;
                height: 100%;
                pointer-events: none;`;

        if (config.type === "steps") {
            points.forEach((point) => {
                const { x, y } = point;
                const { linkedTo } = point as StepPoint;

                const pointDiv = document.createElement("div");
                pointDiv.style = `position: absolute;
                        top: ${y}%;
                        left: ${x}%;
                        width: 0;
                        height: 0;
                        border-left: 10px solid transparent;
                        border-right: 10px solid transparent;
                        border-top: 20px solid #000;`;

                if (linkedTo && linkedTo.length > 0) {
                    // Generate a svg with lines between the points

                    const svg = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg"
                    );
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "100%");
                    svg.setAttribute("viewBox", "0 0 100 100");
                    svg.setAttribute("pointer-events", "none");

                    linkedTo.forEach((linkedTo) => {
                        let p = points.find((p) => p.name === linkedTo);

                        if (!p) return;

                        const line = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "line"
                        );

                        line.setAttribute("x1", `${point.x}%`);
                        line.setAttribute("y1", `${point.y}%`);
                        line.setAttribute("x2", `${p.x}%`);
                        line.setAttribute("y2", `${p.y}%`);
                        line.setAttribute("stroke", "#000");
                        line.setAttribute("stroke-width", "2");
                        line.setAttribute("pointer-events", "none");

                        svg.appendChild(line);
                    });
                }

                config.element.appendChild(pointDiv);
            });
        } else if (config.type === "grid") {
            let mainDiv = document.createElement("div");

            mainDiv.style = `display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    gap: 0;`;

            let c = config.data as Grid;

            for (let i = 0; i < c.height; i++) {
                let columnDiv = document.createElement("div");
                columnDiv.style = `display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 0;`;

                for (let j = 0; j < c.width; j++) {
                    const box = c.boxes.find((box) => box.name === `${i}-${j}`);

                    let rowDiv = document.createElement("div");
                    rowDiv.style = `display: flex;
                                 flex-direction: row;
                                 align-items: center;
                                 justify-content: center;
                                 width: ${config.boxSize}px;
                                 height: ${config.boxSize}px;
                                 pointer-events: "all";
                                 gap: 0;`;

                    rowDiv.classList.add("box");

                    columnDiv.appendChild(rowDiv);
                }

                mainDiv.appendChild(columnDiv);
            }

            config.element.appendChild(mainDiv);
        }
    };
};
