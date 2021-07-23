FROM node:16
WORKDIR /usr/src/map

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node packages
COPY package*.json ./
RUN npm install

# Build and install indoor_map_lib code
RUN mkdir tmp
RUN git clone https://gitlab.com/wchs-map/indoor-map-lib.git tmp/indoor-map-lib
RUN cd tmp/indoor-map-lib && cargo install --all-features --path .
RUN rm -r tmp

EXPOSE 10001