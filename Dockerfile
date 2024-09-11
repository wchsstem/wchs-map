FROM node:16
WORKDIR /usr/src/map

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain none -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install 1.53.0
ENV CARGO_INSTALL_ROOT="/usr/"

# Give Node permissions
RUN npm config set user 0
RUN npm config set unsafe-perm true

# Build and install indoor_map_lib code
RUN mkdir tmp
RUN git clone https://github.com/wchsstem/indoor-map-lib
RUN cd tmp/indoor-map-lib && cargo install --all-features --path .
RUN rm -r tmp

# Install Node packages
COPY package*.json ./
RUN npm install --unsafe-perm --allow-root --loglevel verbose

COPY . .

# Compile map JSON
RUN /bin/bash -c ""
RUN npm run compileMapJson

EXPOSE 10001
