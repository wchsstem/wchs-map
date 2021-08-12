FROM node:16
WORKDIR /usr/src/map

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain none -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install 1.51.0
ENV CARGO_INSTALL_ROOT="/usr/"

# Give Node permissions
RUN npm config set user 0
RUN npm config set unsafe-perm true

ARG CACHE_BUST

# Build and install indoor_map_lib binaries
RUN wget https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/compile_map_json?job=build -O /usr/bin/compile_map_json
RUN chmod +x /usr/bin/compile_map_json
RUN wget https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/svg_splitter?job=build -O /usr/bin/svg_splitter
RUN chmod +x /usr/bin/svg_splitter
RUN wget https://gitlab.com/wchs-map/indoor-map-lib/-/jobs/artifacts/master/raw/target/release/map_drawer?job=build -O /usr/bin/map_drawer
RUN chmod +x /usr/bin/map_drawer

# Install Node packages
COPY package*.json ./
RUN npm install --unsafe-perm --allow-root --loglevel verbose

COPY . .

# Compile map JSON
RUN /bin/bash -c ""
RUN npm run compile-json-svg

EXPOSE 10001
