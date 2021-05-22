import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import html from "@web/rollup-plugin-html";
import json from "rollup-plugin-json";
import progress from "rollup-plugin-progress";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import styles from "rollup-plugin-styles";
import typescript from "@rollup/plugin-typescript";
import versionInjector from "rollup-plugin-version-injector";

// TODO: Read the SVG files to copy from map.json
export default [
    {
        input: "./src/index.html",
        output: {
            dir: "./dist"
        },
        plugins: [
            html({
                extractAssets: false
            })
        ]
    },
    {
        input: "./src/ts/main.ts",
        output: {
            file: "./dist/bundle.js",
            format: "iife",
            sourcemap: true,
            assetFileNames: "assets/[name][extname]"
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                cacheDir: ".rollup.tscache"
            }),
            styles({
                use: ["sass"],
                mode: ["extract", "bundle.css"]
            }),
            json({
                exclude: "node_modules/**",
                preferConst: true
            }),
            versionInjector({
                injectInComments: false
            }),
            copy({
                targets: [
                    "./src/assets/",
                    "./src/manifest.json"
                ],
                outputFolder: "dist"
            }),
            progress(),
            serve({
                contentBase: "dist",
                host: "0.0.0.0",
                // https: {
                //     // Generate via `openssl req -nodes -new -x509 -keyout server.key -out server.cert`
                //     key: fs.readFileSync("./ssl/server.key"),
                //     cert: fs.readFileSync("./ssl/server.cert")
                // }
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
            typescript({
                target: "es2017"
            }),
            versionInjector({
                injectInComments: false
            }),
            progress()
        ]
    }
]
