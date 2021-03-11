import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import json from "rollup-plugin-json";
import progress from "rollup-plugin-progress";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import scss from "rollup-plugin-scss";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "./src/ts/main.ts",
        output: {
            file: "./dist/bundle.js",
            format: "iife",
            compact: true,
            sourcemap: false
        },
        plugins: [
            nodeResolve(),
            commonjs(),
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
            terser(),
            progress()
        ]
    },
    {
        input: "./src/ts/serviceWorker.ts",
        output: {
            file: "./dist/serviceWorker.js",
            format: "iife",
            compact: true,
            sourcemap: false
        },
        plugins: [
            typescript(),
            terser(),
            progress()
        ]
    }
]
