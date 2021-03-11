import * as L from "leaflet";
import { fromMap, None, Option, Some } from "@nvarner/monads";

import Graph from "./Graph";
import Room from "./Room";
import Vertex from "../Vertex";
import { LSomeLayerWithFloor, LLayerGroupWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { GeocoderDefinition } from "./Geocoder";
import { BuildingLocation, BuildingLocationWithEntrances } from "./BuildingLocation";

export type FloorData = {
    number: string,
    image: string
}

const STAIRS_WEIGHT = 10;

export default class MapData {
    private vertexStringToId: Map<string, number>;
    private graph: Graph<number, Vertex>;
    private rooms: Map<string, Room>;
    private roomsFromNames: Map<string, Room[]>;
    private floors: FloorData[];
    private edges: [string, string, Option<boolean>][];
    private bounds: L.LatLngBounds;

    constructor(mapData: {
        floors: FloorData[],
        vertices: Array<{
            floor: string,
            location: [number, number],
            tags: string[]
        }>,
        edges: [string, string, boolean?][],
        rooms: Array<{
            vertices: string[],
            center?: [number, number],
            outline: [number, number][],
            names: string[],
            area?: number
        }>
    }, bounds: L.LatLngBounds) {
        this.vertexStringToId = new Map();
        let nextVertexId = 0;
        for (const vertexName in mapData.vertices) {
            this.vertexStringToId.set(vertexName, nextVertexId);
            nextVertexId++;
        }

        this.graph = new Graph<number, Vertex>();
        for (const vertexName in mapData.vertices) {
            const vertexId = fromMap(this.vertexStringToId, vertexName).unwrap();
            this.graph.addVertex(vertexId, new Vertex(mapData.vertices[vertexName]));
        }

        for (const edge of mapData.edges) {
            const pId = fromMap(this.vertexStringToId, edge[0]).unwrap();
            const qId = fromMap(this.vertexStringToId, edge[1]).unwrap();

            const p = this.graph.getVertex(pId);
            const q = this.graph.getVertex(qId);

            const pLoc = p.getLocation();
            const qLoc = q.getLocation();
            const distance = pLoc.distanceTo(qLoc).unwrapOr(STAIRS_WEIGHT);

            if (edge[2] !== undefined && edge[2]) {
                // Directed edge
                this.graph.addDirectedEdge(pId, qId, distance);
            } else {
                this.graph.addEdge(pId, qId, distance);
            }
        }

        // Create map of rooms
        this.rooms = new Map();
        for (const roomNumber in mapData.rooms) {
            const room = mapData.rooms[roomNumber];

            const someVertex = this.graph.getVertex(fromMap(this.vertexStringToId, room.vertices[0]).unwrap());
            const floorNumber = someVertex.getLocation().floor;
            const center = room.center
                ? new BuildingLocation(new L.LatLng(room.center[1], room.center[0]), floorNumber)
                : someVertex.getLocation();

            // Turn the string array into a number array
            const verticesString: string[] = room.vertices;
            const verticesId: number[] = [];
            for (const vertex of verticesString) {
                if (this.vertexStringToId.get(vertex) === undefined) {
                    console.log(`Unknown vertex: ${vertex}`);
                } else {
                    verticesId.push(fromMap(this.vertexStringToId, vertex).unwrap());
                }
            }

            const area = room.area ?? 0;

            this.rooms.set(roomNumber, new Room(verticesId, roomNumber, room.names, room.outline, center, area));
        }

        // Create map of room names
        this.roomsFromNames = new Map();
        for (const [roomNumber, room] of this.rooms) {
            for (const name of room.names) {
                if (!this.roomsFromNames.has(name)) {
                    this.roomsFromNames.set(name, []);
                }
                fromMap(this.roomsFromNames, name).unwrap().push(room);
            }
        }

        this.floors = mapData.floors;
        this.edges = mapData.edges.map((edge) => [edge[0], edge[1], edge[2] === undefined ? None : Some(edge[2])]);
        this.bounds = bounds;
    }

    getBounds(): L.LatLngBounds {
        return this.bounds;
    }

    getGraph(): Graph<number, Vertex> {
        return this.graph;
    }

    getRoom(roomId: string): Room {
        return fromMap(this.rooms, roomId).unwrap();
    }

    getAllRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    getRoomsFromName(name: string): Room[] {
        return fromMap(this.roomsFromNames, name).unwrap();
    }

    findBestPath(
        src: GeocoderDefinition<BuildingLocationWithEntrances>,
        dest: GeocoderDefinition<BuildingLocationWithEntrances>
    ): number[] {
        let prev = null;
        let shortestDistance = null;
        let destVertex = null;
    
        // Look through all exits from the source
        for (const exitLocation of src.location.getEntrances()) {
            const exitId = this.getClosestVertex(exitLocation);
            const [dist, maybePrev] = this.graph.dijkstra(exitId);
    
            // Look through all entrances to the destination
            for (const entranceLocation of dest.location.getEntrances()) {
                const entranceId = this.getClosestVertex(entranceLocation);

                // Find the distance between the source and destination
                const distance = fromMap(dist, entranceId).unwrap();
                // If the distance is shortest, choose it
                if (shortestDistance === null || distance < shortestDistance) {
                    shortestDistance = distance;
                    prev = maybePrev;
                    destVertex = entranceId;
                }
            }
        }

        if (prev === null || destVertex === null) {
            // TODO: Proper error handling
            throw "No path between vertices";
        }
    
        const fastestPath: number[] = [];
        let nextPlace: Option<number> = Some(destVertex);
    
        while (nextPlace.isSome()) {
            fastestPath.push(nextPlace.unwrap());
            nextPlace = fromMap(prev, nextPlace.unwrap()).match({
                some: place => place === null ? None : Some(place),
                none: None
            });
        }
    
        return fastestPath;
    }

    createDevLayerGroup(floor: string): LSomeLayerWithFloor {
        // Create layer showing points and edges
        const devLayer = new LLayerGroupWithFloor([], {
            floorNumber: floor
        });
        for (const edge of this.edges) {
            const p = this.graph.getVertex(fromMap(this.vertexStringToId, edge[0]).unwrap());
            const q = this.graph.getVertex(fromMap(this.vertexStringToId, edge[1]).unwrap());
            
            if (p.getLocation().floor === floor && q.getLocation().floor === floor) {
                const pLoc = p.getLocation();
                const qLoc = q.getLocation();
                L.polyline([pLoc.xy, qLoc.xy]).addTo(devLayer);
            }
        }

        for (const [vertexString, vertexId] of this.vertexStringToId.entries()) {
            const vertex = this.graph.getVertex(vertexId);
            if (vertex.getLocation().floor === floor) {
                const color = vertex.hasTag("stairs") || vertex.hasTag("elevator") ? "#0000ff" : "#00ff00";
                const location = vertex.getLocation().xy;
                L.circle(vertex.getLocation().xy, {
                    "radius": 1,
                    "color": color
                }).bindPopup(`${vertexString} (${vertexId})<br/>${location.lng}, ${location.lat}`).addTo(devLayer);
            }
        }
        
        return devLayer;
    }

    /**
     * Create layer groups displaying a path, one for each floor of a building.
     * @param path The path to create a group for
     */
    createLayerGroupsFromPath(path: number[]): Set<LSomeLayerWithFloor> {
        const layers = new Map();
        let last = path[0];

        for (const vert of path) {
            const p = this.graph.getVertex(last);
            const q = this.graph.getVertex(vert);
            const pLoc = p.getLocation();
            const qLoc = q.getLocation();
            const pFloor = pLoc.floor;
            const qFloor = qLoc.floor;

            if (pFloor === qFloor) {
                // Same floor, draw path from p to q
                if (!layers.has(pFloor)) {
                    layers.set(pFloor, new LLayerGroupWithFloor([], { floorNumber: pFloor }));
                }
                L.polyline([pLoc.xy, qLoc.xy], { "color": "#ff0000" }).addTo(layers.get(pFloor));
            } else {
                // Different floor, change floors
                if (!layers.has(pFloor)) {
                    layers.set(pFloor, new LLayerGroupWithFloor([], { floorNumber: pFloor }));
                }

                if (!layers.has(qFloor)) {
                    layers.set(qFloor, new LLayerGroupWithFloor([], { floorNumber: qFloor }));
                }

                // TODO: Add proper floor indexing so we don't have to hope that floors are integers
                const pFloorNumber = parseInt(pFloor);
                const qFloorNumber = parseInt(qFloor);

                
                // These icons aren't actually stairs, but they look close enough to get the idea across
                // They also look much nicer than my poor attempt at creating a stair icon
                const stairIcon = L.divIcon({
                    html: qFloorNumber < pFloorNumber ? "<i class=\"fas fa-sort-amount-up-alt stair-icon\"></i>" : "<i class=\"fas fa-sort-amount-down-alt stair-icon\"></i>",
                    iconSize: [36, 36]
                });
                L.marker(pLoc.xy, { icon: stairIcon }).addTo(layers.get(pFloor));
                L.marker(qLoc.xy, { icon: stairIcon }).addTo(layers.get(qFloor));
            }
            last = vert;
        }

        return new Set(layers.values());
    }

    getFloors(): FloorData[] {
        return this.floors;
    }

    private getClosestVertex(location: BuildingLocation): number {
        const idVertexToIdDistance = function(idVertex: [number, Vertex]): [number, Option<number>] {
            const [id, vertex] = idVertex;
            return [id, vertex.getLocation().distanceTo(location)];
        }

        const [closestId, _distance] = this.graph.getIdsAndVertices()
            .map(idVertexToIdDistance)
            .filter(([_id, distance]) => distance.isSome())
            .map(([id, distanceOption]) => [id, distanceOption.unwrap()])
            .reduce(([minimumId, minimumDistance], [id, distance]) =>
                distance < minimumDistance ? [id, distance] : [minimumId, minimumDistance]);
        
        return closestId;
    }
}