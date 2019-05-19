import * as L from "leaflet";

import Graph from "./Graph";
import Room from "./Room";
import Vertex from "../Vertex";

export default class MapData {
    private vertexStringToId: Map<String, number>;
    private graph: Graph<number, Vertex>;
    private rooms: Map<string, Room>;
    private roomsFromNames: Map<string, Room[]>
    private images: Map<string, string>;
    private edges: [string, string][];

    constructor(mapData: {
        "map_images": Map<string, string>,
        "vertices": Array<{
            "id": string,
            "floor": string,
            "location": [number, number],
            "tags": string[]
        }>,
        "edges": [string, string][],
        "rooms": Array<{
            "vertices": string[],
            center?: [number, number],
            "names": string[]
        }>
    }) {
        // Create vertex string to id map
        this.vertexStringToId = new Map();
        let nextVertexId = 0;
        for (const vertex of mapData.vertices) {
            this.vertexStringToId.set(vertex.id, nextVertexId);
            nextVertexId++;
        }

        // Create graph
        this.graph = new Graph<number, Vertex>();
        // Load vertices into graph
        for (const vertex of mapData.vertices) {
            this.graph.addVertex(this.vertexStringToId.get(vertex.id), new Vertex(vertex));
        }

        // Load edges into graph
        for (const edge of mapData.edges) {
            const pId = this.vertexStringToId.get(edge[0]);
            const qId = this.vertexStringToId.get(edge[1]);

            const p = this.graph.getVertex(pId);
            const q = this.graph.getVertex(qId);

            const pLoc = p.getLocation();
            const qLoc = q.getLocation();
            const distance = Math.sqrt((pLoc[0] - qLoc[0]) ** 2 + (pLoc[1] - qLoc[1]) ** 2);

            this.graph.addEdge(pId, qId, distance);
        }

        // Create map of rooms
        this.rooms = new Map();
        for (const roomKey of Object.keys(mapData.rooms)) {
            // @ts-ignore: mapData.rooms can be indexed
            const room = mapData.rooms[roomKey];

            // Turn the string array into a number array
            const verticesString: string[] = room.vertices;
            const verticesId: number[] = [];
            for (const vertex of verticesString) {
                if (this.vertexStringToId.get(vertex) === undefined) {
                    console.log(`Unknown vertex: ${vertex}`);
                } else {
                    verticesId.push(this.vertexStringToId.get(vertex));
                }
            }

            this.rooms.set(roomKey, new Room(verticesId, roomKey, room.names, room.center));
        }

        // Create map of room names
        this.roomsFromNames = new Map();
        for (const [roomNumber, room] of this.rooms) {
            for (const name of room.getNames()) {
                if (!this.roomsFromNames.has(name)) {
                    this.roomsFromNames.set(name, []);
                }
                this.roomsFromNames.get(name).push(room);
            }
        }

        this.images = mapData.map_images;
        this.edges = mapData.edges;
    }

    getGraph(): Graph<number, Vertex> {
        return this.graph;
    }

    getRoom(roomId: string): Room {
        return this.rooms.get(roomId);
    }

    getAllRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    getRoomsFromName(name: string): Room[] {
        return this.roomsFromNames.get(name);
    }

    findBastPath(src: Room, dest: Room): number[] {
        let fastestTree = undefined;
        let shortestDistance = undefined;
        let destVertex = undefined;
    
        // Look through all exits from the source
        for (const exit of src.getEntrances()) {
            const [distances, tree] = this.graph.dijkstra(exit);
    
            // Look through all entrances to the destination
            for (const entrance of dest.getEntrances()) {
                // Find the distance between the source and destination
                const distance = distances.get(entrance);
                // If the distance is shortest, choose it
                if (shortestDistance === undefined || distance < shortestDistance) {
                    shortestDistance = distance;
                    fastestTree = tree;
                    destVertex = entrance;
                }
            }
        }
    
        const fastestPath: number[] = [];
        let nextPlace = destVertex;
    
        while (fastestTree.get(nextPlace) !== undefined) {
            fastestPath.push(nextPlace);
            nextPlace = fastestTree.get(nextPlace);
        }
        fastestPath.push(nextPlace);
    
        return fastestPath;
    }

    createDevLayerGroup(floor: string): L.LayerGroup {
        // Create layer showing points and edges
        const devLayer = L.layerGroup();
        for (const edge of this.edges) {
            const p = this.graph.getVertex(this.vertexStringToId.get(edge[0]));
            const q = this.graph.getVertex(this.vertexStringToId.get(edge[1]));
            
            if (p.getFloor() === floor && q.getFloor() === floor) {
                const pLoc = p.getLocation();
                const qLoc = q.getLocation();
                L.polyline([[pLoc[1], pLoc[0]], [qLoc[1], qLoc[0]]]).addTo(devLayer);
            }
        }

        for (const [vertexString, vertexId] of this.vertexStringToId.entries()) {
            const vertex = this.graph.getVertex(vertexId);
            if (vertex.getFloor() === floor) {
                const color = vertex.hasTag("stairs") || vertex.hasTag("elevator") ? "#0000ff" : "#00ff00";
                L.circle([vertex.getLocation()[1], vertex.getLocation()[0]], {
                    "radius": 1,
                    "color": color
                }).bindPopup(`${vertexString}<br/>${vertex.getLocation()[0]}, ${vertex.getLocation()[1]}`).addTo(devLayer);
            }
        }
        
        return devLayer;
    }

    /**
     * Create layer groups displaying a path, one for each floor of a building.
     * @param path The path to create a group for
     */
    createLayerGroupsFromPath(path: number[]): Map<string, L.LayerGroup> {
        const layers = new Map();
        let last = path[0];

        for (const vert of path) {
            const p = this.graph.getVertex(last);
            const q = this.graph.getVertex(vert);
            const pLoc = p.getLocation();
            const qLoc = q.getLocation();

            if (p.getFloor() === q.getFloor()) {
                // Same floor, draw path from p to q
                if (!layers.has(p.getFloor())) {
                    layers.set(p.getFloor(), L.layerGroup());
                }
                L.polyline([[pLoc[1], pLoc[0]], [qLoc[1], qLoc[0]]], { "color": "#ff0000" }).addTo(layers.get(p.getFloor()));
            } else {
                // Different floor, change floors
                if (!layers.has(p.getFloor())) {
                    layers.set(p.getFloor(), L.layerGroup());
                }

                if (!layers.has(q.getFloor())) {
                    layers.set(q.getFloor(), L.layerGroup());
                }

                const stairIcon = L.icon({
                    iconUrl: "assets/icons/stair.svg",
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                L.marker([pLoc[1], pLoc[0]], { icon: stairIcon }).addTo(layers.get(p.getFloor()));
                L.marker([qLoc[1], qLoc[0]], { icon: stairIcon }).addTo(layers.get(q.getFloor()));
            }
            last = vert;
        }

        return layers;
    }

    getMapImageUrl(floorNumber: string): string {
        return this.images[floorNumber];
    }
}