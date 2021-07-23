# Churchill Map
This is a PWA map of Churchill HS. This project aims to provide a high quality, easy to use map that can be used on any school devices and most personal devices, online or offline.

## Building
Use `npm run watch` to launch a development server. It will automatically pick up changes to TypeScript files. Changes to `map.json` need to be compiled into `map_compiled.json` via [`indoor-map-lib`](https://gitlab.com/nvarner/indoor-map-lib), a Rust library. It should be installed with the `compile_map_json` feature so it includes the `compile_map_json` binary. After installation, it can be used via `npm run compileMapJson`.

## Docker
We use Docker to simplify development environment setup and production builds. The only prerequisite for building this
project is installing Docker, so do that before running the commands that follow.

### Building the image
A Docker image is basically a snapshot of a computer that was set up according to a `Dockerfile`. When that file
changes, the image should be rebuilt, but if it hasn't changed, you (usually) won't need to rebuild the image. You will
have to rebuild if dependencies are added, removed, or updated, or if the `indoor_map_lib` Rust tool is updated.

Run `docker build -t churchill-map .` to build the image. The first build is slow; subsequent builds will use a cache
and be much faster.

### Development
Run `docker run -p 10001:10001 -v $PWD:/usr/src/map churchill-map npm run watch`
(`docker run -p 10001:10001 -v $CD:/usr/src/map churchill-map npm run watch` on Windows) to launch the development
server in a Docker container.

To stop a running container, you may need to run `docker ps` to find the hex string ID of the running container, then
run `docker stop <hex string ID>` to force it to exit.

### Production
Run `docker run -p 10001:10001 -v $PWD:/usr/src/map -e "NODE_ENV=production" churchill-map npm run build` to generate a
production build.