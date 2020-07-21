import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import json from "rollup-plugin-json";
import progress from "rollup-plugin-progress";
import resolve from "rollup-plugin-node-resolve";
import scss from "rollup-plugin-scss";
import serve from "rollup-plugin-serve";
import typescript from "rollup-plugin-typescript";
import * as fs from "fs";

// TODO: Read the SVG files to copy from map.json
export default [
    {
        input: "./src/ts/main.ts",
        output: {
            file: "./dist/bundle.js",
            format: "iife",
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs({
                namedExports: {
                    "node_modules/rbush/index.js": ["default"],
                    "node_modules/leaflet/dist/leaflet-src.js": [
                        "divIcon", "marker", "layerGroup", "popup", "imageOverlay",
                        "CRS", "map", "LatLngBounds", "Control", "DomElement",
                        "DomEvent", "Util", "polyline", "circle", "LayerGroup",
                        "icon", "Layer", "polygon", "control", "circleMarker"
                    ]
                }
            }),
            typescript(),
            scss(),
            json({
                exclude: "node_modules/**",
                preferConst: true
            }),
            copy({
                targets: [
                    "./src/index.html",
                    "./src/assets/",
                    "./src/manifest.json"
                ],
                outputFolder: "dist"
            }),
            progress(),
            serve({
                contentBase: "dist",
                host: "0.0.0.0",
                https: {
                    // Generate via `openssl req -nodes -new -x509 -keyout server.key -out server.cert`
                    key: fs.readFileSync("./ssl/server.key"),
                    cert: fs.readFileSync("./ssl/server.cert")
                }
            })
        ]
    },
    {
        input: "./src/ts/serviceWorker.ts",
        output: {
            file: "./dist/serviceWorker.js",
            format: "iife",
            sourcemap: true
        },
        plugins: [
            typescript(),
            progress()
        ]
    }
]
