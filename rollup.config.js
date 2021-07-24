import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import html from "@web/rollup-plugin-html";
import json from "@rollup/plugin-json";
import progress from "rollup-plugin-progress";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import styles from "rollup-plugin-styles";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import versionInjector from "rollup-plugin-version-injector";

export default [
    {
        input: "./src/index.html",
        output: {
            dir: "./dist"
        },
        plugins: [
            html({
                minify: true,
                extractAssets: false
            })
        ]
    },
    {
        input: "./src/ts/main.ts",
        output: {
            file: "./dist/bundle.js",
            format: "iife",
            compact: true,
            sourcemap: false,
            assetFileNames: "assets/[name][extname]"
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript(),
            styles({
                use: ["sass"],
                mode: ["extract", "bundle.css"],
                minimize: true
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
            versionInjector({
                injectInComments: false
            }),
            terser(),
            progress()
        ]
    }
]
