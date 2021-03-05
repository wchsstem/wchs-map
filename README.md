# Churchill Map
This is a PWA map of Churchill HS. This project aims to provide a high quality, easy to use map that can be used on any school devices and most personal devices, online or offline.

## Building
Use `npm run watch` to launch a development server. It will automatically pick up changes to TypeScript files. Changes to `map.json` need to be compiled into `map_compiled.json` via [`indoor-map-lib`](https://gitlab.com/nvarner/indoor-map-lib), a Rust library. It should be installed with the `compile_map_json` feature so it includes the `compile_map_json` binary. After installation, it can be used via `npm run compileMapJson`.
