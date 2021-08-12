FROM node:16
WORKDIR /usr/src/map

# Give Node permissions
RUN npm config set user 0
RUN npm config set unsafe-perm true

# Build and install indoor_map_lib binaries
ADD https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/compile_map_json?job=build /usr/bin/compile_map_json
ADD https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/svg_splitter?job=build /usr/bin/svg_splitter
ADD https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/map_drawer?job=build /usr/bin/map_drawer
RUN chmod +x /usr/bin/compile_map_json
RUN chmod +x /usr/bin/svg_splitter
RUN chmod +x /usr/bin/map_drawer

# Install Node packages
COPY package*.json ./
RUN npm install --unsafe-perm --allow-root --loglevel verbose

COPY . .

# Compile map JSON
RUN npm run compile-json-svg

EXPOSE 10001
