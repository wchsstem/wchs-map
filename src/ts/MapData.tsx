import { fromMap, None, Option, Some } from "@nvarner/monads";

import { Graph } from "./Graph";
import Room from "./Room";
import { Vertex, VertexTag } from "./Vertex";
import { LSomeLayerWithFloor, LLayerGroupWithFloor } from "./LFloorsPlugin/LFloorsPlugin";
import { GeocoderDefinition } from "./Geocoder";
import { BuildingLocation } from "./BuildingLocation";

import { h } from "../ts/JSX";
import { circle, divIcon, LatLng, marker, polyline } from "leaflet";
import { flatten, zip, zipInto } from "./functional";
import { t } from "./Tuple";

type Floor = {
    number: string,
    image: string
}

/**
 * JSON representation of a vertex in the navigation graph
 */
type JsonVertex = {
    floor: string,
    location: [number, number],
    tags: VertexTag[]
}

type JsonVertices = { [vertexId: string]: JsonVertex };

/**
 * JSON representation of an edge in the navigation graph
 * `[fromVertexId, toVertexId, isDirected]`
 * If `isDirected` is `true`, the edge is one-way only, from the first vertex to the second. Otherwise, it's two-way.
 */
type JsonEdge = [string, string, boolean?];

/**
 * Representation of an edge in the navigation graph
 * `[fromVertexId, toVertexId, isDirected]`
 * If `isDirected` is `true`, the edge is one-way only, from the first vertex to the second. Otherwise, it's two-way.
 */
type Edge = [string, string, boolean];

/**
 * JSON representation of a room
 */
type JsonRoom = {
    /**
     * IDs of vertices which are entrances to the room
     */
    vertices: string[],
    center?: [number, number],
    outline: [number, number][],
    /**
     * Names of the room. If none are provided, the name is generated from the room number (stored as the key in the
     * room map). If some are provided, only the first name is shown to the user. The others are used in search.
     */
    names?: string[],
    area?: number,
    tags?: string[]
}

type JsonRooms = { [roomNumber: string]: JsonRoom };

/**
 * JSON representation of the entire map
 */
type JsonMap = {
    floors: Floor[],
    vertices: JsonVertices,
    edges: JsonEdge[],
    rooms: JsonRooms
}

const STAIRS_WEIGHT = 10;

export class MapData {
    private readonly vertexStringToId: Map<string, number>;
    private readonly graph: Graph<number, Vertex>;
    private readonly rooms: Map<string, Room>;
    private readonly roomsFromNames: Map<string, Room[]>;
    private readonly floors: Floor[];
    private readonly edges: Edge[];
    private readonly bounds: L.LatLngBounds;

    public constructor(mapData: JsonMap, bounds: L.LatLngBounds) {
        this.vertexStringToId = MapData.createVertexNameMapping(mapData.vertices);
        this.graph = MapData.navigationGraph(mapData.vertices, mapData.edges, this.vertexStringToId);
        this.rooms = MapData.roomNumberMapping(mapData.rooms, this.vertexStringToId, this.graph);
        this.roomsFromNames = MapData.roomNameMapping([...this.rooms.values()]);
        this.floors = mapData.floors;
        this.edges = mapData.edges.map(([from, to, directed]) => [from, to, !!directed]);
        this.bounds = bounds;
    }

    /**
     * Creates a map from vertex names to integer IDs
     * @param jsonVertices Vertices to create the mapping for
     */
    private static createVertexNameMapping(jsonVertices: JsonVertices): Map<string, number> {
        const nameToIdArray = Object.entries(jsonVertices)
            .map(([name, _vertex], id) => t(name, id));
        return new Map(nameToIdArray);
    }

    /**
     * Create the navigation graph for a map
     * @param jsonVertices JSON vertex data
     * @param jsonEdges JSON edge data
     * @param vertexStringToId Mapping from vertex string names to integer IDs
     * @returns Navigation graph for the map
     */
    private static navigationGraph(
        jsonVertices: JsonVertices,
        jsonEdges: JsonEdge[],
        vertexStringToId: Map<string, number>
    ): Graph<number, Vertex> {
        const verticesArray = Object.entries(jsonVertices)
            .map(([name, _vertex]) => t(name, vertexStringToId.get(name)!))
            .map(([name, id]) => t(id, new Vertex(jsonVertices[name])));
        const vertices = new Map(verticesArray);

        const edgeDirected = jsonEdges.map(([_from, _to, directed]) => directed ?? false);
        const edgeEndpointIds = jsonEdges
            .map(([from, to, _directed]) =>
                t(vertexStringToId.get(from)!, vertexStringToId.get(to)!));
        const edgeWeights = edgeEndpointIds
            .map(([from, to]) => t(vertices.get(from)!, vertices.get(to)!))
            .map(([from, to]) => from.getLocation().distanceTo(to.getLocation()).unwrapOr(STAIRS_WEIGHT));
        const edges = zipInto(zipInto(edgeEndpointIds, edgeWeights), edgeDirected);

        return new Graph<number, Vertex>(vertices, edges);
    }

    /**
     * Create the mapping from room numbers to `Room`s
     * @param jsonNumbersRooms JSON room data
     * @param vertexNameMapping Mapping from vertex string names to integer IDs
     * @param navigationGraph Navigation graph for map
     * @returns Mapping from room numbers to `Room`s
     */
    private static roomNumberMapping(
        jsonNumbersRooms: JsonRooms,
        vertexNameMapping: Map<string, number>,
        navigationGraph: Graph<number, Vertex>
    ): Map<string, Room> {
        const roomNumbers = Object.keys(jsonNumbersRooms);
        const jsonRooms = Object.values(jsonNumbersRooms);
        const someVertices = jsonRooms
            .map(room => navigationGraph.getVertex(vertexNameMapping.get(room.vertices[0])!));
        const roomFloorNumbers = someVertices.map(roomVertex => roomVertex.getLocation().getFloor());
        const roomCenters = zipInto(zip(jsonRooms, someVertices), roomFloorNumbers)
            .map(([room, vertex, floor]) => room.center !== undefined
                ? new BuildingLocation(new LatLng(room.center[1], room.center[0]), floor)
                : vertex.getLocation()
            );
        const roomEntrances = jsonRooms
            .map(room => room.vertices
                .map(vertexStringId => vertexNameMapping.get(vertexStringId)!)
                .map(vertexId => navigationGraph.getVertex(vertexId).getLocation())
            );
        const roomsArray = zipInto(zipInto(zip(roomNumbers, roomEntrances), jsonRooms), roomCenters)
                .map(([roomNumber, entrances, room, center]) => t(
                    roomNumber,
                    new Room(entrances, roomNumber, room.names ?? [], room.outline, center, room.area ?? 0, room.tags ?? [])
                ));
        return new Map(roomsArray);
    }

    /**
     * Create the mapping from names to rooms with that name
     * @param rooms Rooms to create the mapping for
     */
    private static roomNameMapping(rooms: Room[]): Map<string, Room[]> {
        const roomNames = rooms.map(room => room.names ?? []);
        const roomsToNames = zip(rooms, roomNames);
        const namesToRoom = flatten(roomsToNames.map(([room, names]) => names.map(name => t(name, room))));
        return namesToRoom.reduce((mapping, [name, room]) => {
            if (!mapping.has(name)) {
                mapping.set(name, []);
            }
            mapping.get(name)!.push(room);
            return mapping;
        }, new Map());
    }

    /**
     * Get the bounds of the map
     */
    public getBounds(): L.LatLngBounds {
        return this.bounds;
    }

    /**
     * Get the map's navigation graph
     */
    public getGraph(): Graph<number, Vertex> {
        return this.graph;
    }

    /**
     * Get the room with the specified room number
     */
    public getRoom(roomNumber: string): Room {
        return this.rooms.get(roomNumber)!;
    }

    public getAllRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    public getAllFloors(): Floor[] {
        return this.floors;
    }

    /**
     * Get the IDs of the entrance vertices of a definition
     */
    private entranceVertexIds(definition: GeocoderDefinition): number[] {
        return definition.getLocation().getEntrances().map(entrance => this.getClosestVertex(entrance));
    }

    /**
     * Run Dijkstra's algorithm on all exits from a definition
     * @param src Definition to run Dijkstra's algorithm on
     * @returns Results of running on each exit and the exit vertex IDs. See also `Graph.dijkstra`
     */
    private definitionDijkstra(src: GeocoderDefinition): [Map<number, number>, Map<number, number | null>, number][] {
        const entrances = this.entranceVertexIds(src);
        return zipInto(entrances.map(exitId => this.graph.dijkstra(exitId)), entrances);
    }

    /**
     * Find the best path from `src` to `dest`
     * @param src Definition to start from
     * @param dest Definition to end at
     * @returns Path from `src` to `dest` with the lowest total weight, if any exists, as an array of vertex IDs
     */
    public findBestPath(src: GeocoderDefinition, dest: GeocoderDefinition): Option<number[]> {
        const destEntrances = this.entranceVertexIds(dest);

        const results = this.definitionDijkstra(src);
        const pathOptions = flatten(results
            .map(([dist, prev, exit]) => destEntrances.map(entrance => t(dist.get(entrance)!, prev, entrance, exit))));
        if (pathOptions.length === 0) {
            // Either src or dest had no entrances
            return None;
        }

        const [shortestDistance, prev, destVertex, srcVertex] = pathOptions
            .reduce((best, current) => current[0] < best[0] ? current : best);
        if (shortestDistance === Infinity) {
            // No path exists from src to dest
            return None;
        }

        return this.graph.pathFromPrev(srcVertex, destVertex, prev);
    }

    /**
     * Find the length of the best path from `src` to `dest`
     * @param src Definition to start from
     * @param dest Definition to end on
     * @returns Total weight of the lowest weight path, if such a path exists
     */
    public findBestPathLength(src: GeocoderDefinition, dest: GeocoderDefinition): Option<number> {
        const destEntrances = this.entranceVertexIds(dest);
        const results = this.definitionDijkstra(src);
        const distances = flatten(results.map(([dist]) => destEntrances.map(entrance => dist.get(entrance)!)));
        return distances.length > 0 ? Some(Math.min(...distances)) : None;
    }

    /**
     * Get the color to use when rendering a vertex
     * @returns Hex color code, eg. "#0000ff" for blue
     */
    private static vertexColor(vertex: Vertex): string {
        return vertex.hasTag(VertexTag.Stairs) || vertex.hasTag(VertexTag.Elevator) ? "#0000ff" : "#00ff00";
    }

    /**
     * Create a layer with vertices, edges, and clock location popup for one floor
     * @param floor Floor to create the dev layer for
     */
    public createDevLayerGroup(floor: string): LSomeLayerWithFloor {
        // Create layer showing points and edges
        const devLayer = new LLayerGroupWithFloor([], {
            floorNumber: floor
        });
        for (const edge of this.edges) {
            const p = this.graph.getVertex(this.vertexStringToId.get(edge[0])!);
            const q = this.graph.getVertex(this.vertexStringToId.get(edge[1])!);

            if (p.getLocation().getFloor() === floor && q.getLocation().getFloor() === floor) {
                const pLoc = p.getLocation();
                const qLoc = q.getLocation();
                polyline([pLoc.getXY(), qLoc.getXY()]).addTo(devLayer);
            }
        }

        for (const [vertexString, vertexId] of this.vertexStringToId.entries()) {
            const vertex = this.graph.getVertex(vertexId);
            if (vertex.getLocation().getFloor() === floor) {
                const color = MapData.vertexColor(vertex);
                const location = vertex.getLocation().getXY();
                circle(vertex.getLocation().getXY(), {
                    "radius": 1,
                    "color": color
                }).bindPopup(`${vertexString} (${vertexId})<br/>${location.lng}, ${location.lat}`).addTo(devLayer);
            }
        }

        return devLayer;
    }

    /**
     * Create layer groups displaying a path, one for each floor of a building
     * @param path The path to create a group for
     */
    public createLayerGroupsFromPath(path: number[]): Set<LSomeLayerWithFloor> {
        const layers = new Map();
        let last = path[0];

        for (const vert of path) {
            const p = this.graph.getVertex(last);
            const q = this.graph.getVertex(vert);
            const pLoc = p.getLocation();
            const qLoc = q.getLocation();
            const pFloor = pLoc.getFloor();
            const qFloor = qLoc.getFloor();

            if (pFloor === qFloor) {
                // Same floor, draw path from p to q
                if (!layers.has(pFloor)) {
                    layers.set(pFloor, new LLayerGroupWithFloor([], { floorNumber: pFloor }));
                }
                polyline([pLoc.getXY(), qLoc.getXY()], { "color": "#ff0000" }).addTo(layers.get(pFloor));
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
                const iconClass = qFloorNumber < pFloorNumber ? "fas fa-sort-amount-up-alt" : "fas fa-sort-amount-down-alt";
                const stairIcon = divIcon({
                    html: <i class={iconClass}></i>,
                    className: "icon nav"
                });
                marker(pLoc.getXY(), { icon: stairIcon }).addTo(layers.get(pFloor));
                marker(qLoc.getXY(), { icon: stairIcon }).addTo(layers.get(qFloor));
            }
            last = vert;
        }

        return new Set(layers.values());
    }

    /**
     * Finds the closest vertex to `location` on the same floor as `location`
     * @param location Location to find the closest vertex to
     * @returns ID of the closest vertex
     */
    private getClosestVertex(location: BuildingLocation): number {
        const idVertexToIdDistance2 = function (idVertex: [number, Vertex]): [number, Option<number>] {
            const [id, vertex] = idVertex;
            return [id, vertex.getLocation().distance2To(location)];
        }

        const [closestId, _distance] = this.graph.getIdsAndVertices()
            .map(idVertexToIdDistance2)
            .filter(([_id, distance]) => distance.isSome())
            .map(([id, distanceOption]) => [id, distanceOption.unwrap()])
            .reduce(([minimumId, minimumDistance], [id, distance]) =>
                distance < minimumDistance ? [id, distance] : [minimumId, minimumDistance]);

        return closestId;
    }
}