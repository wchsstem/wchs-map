import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy-assets";
import json from "rollup-plugin-json";
import progress from "rollup-plugin-progress";
import resolve from "rollup-plugin-node-resolve";
import scss from "rollup-plugin-scss";
import serve from "rollup-plugin-serve";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript";

export default {
    input: "./src/main.ts",
    output: {
        file: "./dist/bundle.js",
        format: "iife",
        compact: true
    },
    plugins: [
        resolve(),
        commonjs({
            namedExports: {
                "node_modules/rbush/index.js": ["default"],
                "node_modules/leaflet/dist/leaflet-src.js": [
                    "divIcon", "marker", "layerGroup", "popup", "imageOverlay", "CRS", "map", "LatLngBounds", "Control",
                    "DomElement", "DomEvent", "Util", "polyline", "circle"
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
            assets: [
                "./src/index.html"
            ]
        }),
        terser(),
        progress(),
        serve("dist")
    ]
}
