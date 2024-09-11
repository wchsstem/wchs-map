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

### Compiling map JSON
There is a build step that "compiles" `map.json` and the various SVG floor files into `map_compiled.json`. The tool that
does this is part of the `indoor_map_lib` Rust library. It used to be written in TypeScript, but was too slow. This tool
should be invoked once after building the Docker image with
`docker run -v $PWD:/usr/src/map churchill-map npm run compileMapJson`
(`docker run -v $CD:/usr/src/map churchill-map npm run compileMapJson` on Windows) and after changes are made to
`map.json` or a floor SVG file.

### Development
Run `docker run -p 10001:10001 -it -v $PWD:/usr/src/map churchill-map npm run watch`
(`docker run -p 10001:10001 -it -v $CD:/usr/src/map churchill-map npm run watch` on Windows) to launch the development
server in a Docker container.

To stop a running container, you may need to run `docker ps` to find the hex string ID of the running container, then
run `docker stop <hex string ID>` to force it to exit.

Try /src/map if /usr/src/map does not work

If you need to get a terminal inside the container for debugging purposes, run
`docker run -p 10001:10001 -it -v $PWD:/usr/src/map churchill-map bash`

### Production
Run `docker run -v $PWD:/usr/src/map -e "NODE_ENV=production" churchill-map npm run build` to generate a
production build.

### How to run commands in Docker in general
When you need to run other commands within the Docker container, there are two general methods of doing so.

1. Open a terminal with `docker run -p 10001:10001 -it -v $PWD:/usr/src/map churchill-map bash`, then run commands
2. Put a command at the end of `docker run`, ie.
`docker run -p 10001:10001 -it -v $PWD:/usr/src/map churchill-map <your command here>`

On Windows, replace `$PWD` with `$CD`.
