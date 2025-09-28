var Bordo = function (config, callback) {
    var state = {
        points: [],
        grid: {
            height: 0,
            width: 0,
            boxes: [],
        },
        mousePercent: { x: 0, y: 0 },
        links: [],
    };
    if (config.type === "grid") state.grid = config.data;
    if (config.type === "steps") state.points = config.data;
    var mousemove = function (ev) {
        var rect = ev.target.getBoundingClientRect();
        var x = ((ev.pageX - rect.left) / rect.width) * 100;
        var y = ((ev.pageY - rect.top) / rect.height) * 100;
        callback("mousemove", {
            percentage: { x: x, y: y },
            pixel: { x: ev.clientX, y: ev.clientY },
        });
        state.mousePercent = { x: x * 100, y: y * 100 };
    };
    config.element.addEventListener("mousemove", mousemove);
    return function () {
        config.element.removeEventListener("mousemove", mousemove);
        config.element.innerHTML = "";
        var points = state.points;
        // Setting main styles to the div element
        config.element.style = "".concat(
            config.image
                ? "background-image: url(".concat(config.image, ");")
                : "",
            " \n                background-size: contain;\n                background-position: center center;\n                background-repeat: no-repeat;\n                width: 100%;\n                height: 100%;\n                pointer-events: none;"
        );
        if (config.type === "steps") {
            points.forEach(function (point) {
                var x = point.x,
                    y = point.y;
                var linkedTo = point.linkedTo;
                var pointDiv = document.createElement("div");
                pointDiv.style =
                    "position: absolute;\n                        top: "
                        .concat(y, "%;\n                        left: ")
                        .concat(
                            x,
                            "%;\n                        width: 0;\n                        height: 0;\n                        border-left: 10px solid transparent;\n                        border-right: 10px solid transparent;\n                        border-top: 20px solid #000;"
                        );
                if (linkedTo && linkedTo.length > 0) {
                    // Generate a svg with lines between the points
                    var svg_1 = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg"
                    );
                    svg_1.setAttribute("width", "100%");
                    svg_1.setAttribute("height", "100%");
                    svg_1.setAttribute("viewBox", "0 0 100 100");
                    svg_1.setAttribute("pointer-events", "none");
                    linkedTo.forEach(function (linkedTo) {
                        var p = points.find(function (p) {
                            return p.name === linkedTo;
                        });
                        if (!p) return;
                        var line = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "line"
                        );
                        line.setAttribute("x1", "".concat(point.x, "%"));
                        line.setAttribute("y1", "".concat(point.y, "%"));
                        line.setAttribute("x2", "".concat(p.x, "%"));
                        line.setAttribute("y2", "".concat(p.y, "%"));
                        line.setAttribute("stroke", "#000");
                        line.setAttribute("stroke-width", "2");
                        line.setAttribute("pointer-events", "none");
                        svg_1.appendChild(line);
                    });
                }
                config.element.appendChild(pointDiv);
            });
        } else if (config.type === "grid") {
            var mainDiv = document.createElement("div");
            mainDiv.style =
                "display: flex;\n                    flex-direction: row;\n                    align-items: center;\n                    justify-content: center;\n                    width: 100%;\n                    height: 100%;\n                    gap: 0;";
            var c = config.data;
            var _loop_1 = function (i) {
                var columnDiv = document.createElement("div");
                columnDiv.style =
                    "display: flex;\n                        flex-direction: column;\n                        align-items: center;\n                        justify-content: center;\n                        gap: 0;";
                var _loop_2 = function (j) {
                    var box = c.boxes.find(function (box) {
                        return box.name === "".concat(i, "-").concat(j);
                    });
                    var rowDiv = document.createElement("div");
                    rowDiv.style =
                        "display: flex;\n                                 flex-direction: row;\n                                 align-items: center;\n                                 justify-content: center;\n                                 width: "
                            .concat(
                                config.boxSize,
                                "px;\n                                 height: "
                            )
                            .concat(
                                config.boxSize,
                                'px;\n                                 pointer-events: "all";\n                                 gap: 0;'
                            );

                    rowDiv.classList.add("box");
                    columnDiv.appendChild(rowDiv);
                };
                for (var j = 0; j < c.width; j++) {
                    _loop_2(j);
                }
                mainDiv.appendChild(columnDiv);
            };
            for (var i = 0; i < c.height; i++) {
                _loop_1(i);
            }
            config.element.appendChild(mainDiv);
        }
    };
};
