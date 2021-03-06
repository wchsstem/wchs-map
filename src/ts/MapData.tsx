import { circle, divIcon, LatLng, marker, polyline } from "leaflet";

import { Err, fromMap, None, Ok, Option, Result, Some } from "@nvarner/monads";

import { BuildingLocation } from "./BuildingLocation/BuildingLocation";
import { DefinitionTag } from "./Geocoder/DefinitionTag";
import { GeocoderDefinition } from "./Geocoder/GeocoderDefinition";
import { Graph } from "./Graph";
import { IInjectableFactory } from "./IInjectableFactory";
import { h } from "./JSX";
import {
    LSomeLayerWithFloor,
    LLayerGroupWithFloor,
} from "./LFloorsPlugin/LFloorsPlugin";
import Room from "./Room";
import { Vertex, VertexTag } from "./Vertex";
import { STAIR_WEIGHT } from "./config";
import { extractOption, flatten, goRes, t, zip, zipInto } from "./utils";

type Floor = {
    number: string;
    image: string;
};

/**
 * JSON representation of a vertex in the navigation graph
 */
export type JsonVertex = {
    floor: string;
    location: [number, number];
    tags: VertexTag[];
};

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
    vertices: string[];
    center: [number, number] | null;
    outline: [number, number][];
    /**
     * Names of the room. If none are provided, the name is generated from the room number (stored as the key in the
     * room map). If some are provided, only the first name is shown to the user. The others are used in search.
     */
    names?: string[];
    area?: number;
    tags?: DefinitionTag[];
};

type JsonRooms = { [roomNumber: string]: JsonRoom };

/**
 * JSON representation of the entire map
 */
export type JsonMap = {
    floors: Floor[];
    vertices: JsonVertices;
    edges: JsonEdge[];
    rooms: JsonRooms;
};

export function mapDataFactoryFactory(
    mapData: JsonMap,
    bounds: L.LatLngBounds,
): IInjectableFactory<MapData, readonly []> {
    const factory = (): Result<MapData, string> => {
        return MapData.new(mapData, bounds);
    };
    factory.inject = [] as const;
    return factory;
}

/** Represents and stores all data known about the map */
export class MapData {
    public static new(
        mapData: JsonMap,
        bounds: L.LatLngBounds,
    ): Result<MapData, string> {
        const vertexStringToId = MapData.createVertexNameMapping(
            mapData.vertices,
        );

        const graphErr = goRes(
            MapData.navigationGraph(
                mapData.vertices,
                mapData.edges,
                vertexStringToId,
            ),
        );
        if (graphErr[1] !== null) {
            return Err(graphErr[1]);
        }
        const graph = graphErr[0];

        const roomsErr = goRes(
            MapData.roomNumberMapping(mapData.rooms, vertexStringToId, graph),
        );
        if (roomsErr[1] !== null) {
            return Err(roomsErr[1]);
        }
        const rooms = roomsErr[0];

        const edges = mapData.edges.map(([from, to, directed]) =>
            t(from, to, !!directed),
        );

        return Ok(
            new MapData(
                vertexStringToId,
                graph,
                rooms,
                mapData.floors,
                edges,
                bounds,
            ),
        );
    }

    private constructor(
        private readonly vertexStringToId: Map<string, number>,
        private readonly graph: Graph<number, Vertex>,
        private readonly rooms: Map<string, Room>,
        private readonly floors: Floor[],
        private readonly edges: Edge[],
        private readonly bounds: L.LatLngBounds,
    ) {}

    /**
     * Creates a map from vertex names to integer IDs
     * @param jsonVertices Vertices to create the mapping for
     */
    private static createVertexNameMapping(
        jsonVertices: JsonVertices,
    ): Map<string, number> {
        const nameToIdArray = Object.entries(jsonVertices).map(
            ([name, _vertex], id) => t(name, id),
        );
        return new Map(nameToIdArray);
    }

    /**
     * Create the navigation graph for a map
     * @param jsonVertices JSON vertex data
     * @param jsonEdges JSON edge data
     * @param vertexNameToId Mapping from vertex string names to integer IDs
     * @returns Navigation graph for the map
     */
    private static navigationGraph(
        jsonVertices: JsonVertices,
        jsonEdges: JsonEdge[],
        vertexNameToId: Map<string, number>,
    ): Result<Graph<number, Vertex>, string> {
        const verticesErr = goRes(
            this.navigationGraphVertices(jsonVertices, vertexNameToId),
        );
        if (verticesErr[1] !== null) {
            return Err(verticesErr[1]);
        }
        const vertices = verticesErr[0];

        const edgesErr = goRes(
            this.navigationGraphEdges(jsonEdges, vertexNameToId, vertices),
        );
        if (edgesErr[1] !== null) {
            return Err(edgesErr[1]);
        }
        const edges = edgesErr[0];

        return Ok(new Graph<number, Vertex>(vertices, edges));
    }

    private static navigationGraphVertices(
        jsonVertices: JsonVertices,
        vertexNameToId: Map<string, number>,
    ): Result<Map<number, Vertex>, string> {
        const optVertexIds = extractOption(
            Object.keys(jsonVertices).map((name) =>
                fromMap(vertexNameToId, name),
            ),
        );
        if (optVertexIds.isNone()) {
            return Err(
                "unknown vertex while constructing navigation graph vertices",
            );
        }
        const vertexIds = optVertexIds.unwrap();

        const vertexObjects = Object.values(jsonVertices).map(
            (jsonVertex) => new Vertex(jsonVertex),
        );

        return Ok(new Map(zip(vertexIds, vertexObjects)));
    }

    private static navigationGraphEdges(
        jsonEdges: JsonEdge[],
        vertexNameToId: Map<string, number>,
        vertices: Map<number, Vertex>,
    ): Result<[number, number, number, boolean][], string> {
        const edgeDirected = jsonEdges.map(
            ([_from, _to, directed]) => directed ?? false,
        );

        const optEdgeFromIds = extractOption(
            jsonEdges.map(([from, _to, _directed]) =>
                fromMap(vertexNameToId, from),
            ),
        );
        if (optEdgeFromIds.isNone()) {
            return Err(
                "unknown from vertex name while constructing navigation graph edges",
            );
        }
        const edgeFromIds = optEdgeFromIds.unwrap();

        const optEdgeToIds = extractOption(
            jsonEdges.map(([_from, to, _directed]) =>
                fromMap(vertexNameToId, to),
            ),
        );
        if (optEdgeToIds.isNone()) {
            return Err(
                "unknown to vertex name while constructing navigation graph edges",
            );
        }
        const edgeToIds = optEdgeToIds.unwrap();

        const edgeEndpointIds = zip(edgeFromIds, edgeToIds);

        const optEdgeFromVertices = extractOption(
            edgeFromIds.map((from) => fromMap(vertices, from)),
        );
        if (optEdgeFromVertices.isNone()) {
            return Err(
                "unknown from vertex while constructing navigation graph edges",
            );
        }
        const edgeFromVertices = optEdgeFromVertices.unwrap();

        const optEdgeToVertices = extractOption(
            edgeToIds.map((to) => fromMap(vertices, to)),
        );
        if (optEdgeFromVertices.isNone()) {
            return Err(
                "unknown to vertex while constructing navigation graph edges",
            );
        }
        const edgeToVertices = optEdgeToVertices.unwrap();

        const edgeEndpointVertices = zip(edgeFromVertices, edgeToVertices);

        const edgeWeights = edgeEndpointVertices.map(([from, to]) =>
            from
                .getLocation()
                .distanceTo(to.getLocation())
                .unwrapOr(STAIR_WEIGHT),
        );

        return Ok(zipInto(zipInto(edgeEndpointIds, edgeWeights), edgeDirected));
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
        navigationGraph: Graph<number, Vertex>,
    ): Result<Map<string, Room>, string> {
        const roomNumbers = Object.keys(jsonNumbersRooms);
        const jsonRooms = Object.values(jsonNumbersRooms);

        const vertexNames = jsonRooms.map((room) => room.vertices[0]);
        const vertexIds = vertexNames.map((name) =>
            vertexNameMapping.get(name),
        );

        // Check for no undefined vertex IDs
        const undefinedVertexIds = zip(vertexNames, vertexIds).filter(
            ([_name, id]) => id === undefined,
        );
        if (undefinedVertexIds.length > 0) {
            const unmapped = undefinedVertexIds.map(([name, _id]) => name);
            return Err(`vertices in rooms not assigned IDs: ${unmapped}`);
        }

        const maybeVertices = vertexIds.map((id) =>
            // Just checked for not undefined
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            navigationGraph.getVertex(id!),
        );

        // Check for no None vertices
        const noneVertices = zip(maybeVertices, vertexNames).filter(
            ([vertex, _name]) => vertex.isNone(),
        );
        if (noneVertices.length > 0) {
            const noneVertexNames = noneVertices.map(([_vertex, name]) => name);
            return Err(
                `vertices in rooms not present in navigation graph: ${noneVertexNames}`,
            );
        }

        const vertices = maybeVertices.map((vertex) => vertex.unwrap());
        const roomFloorNumbers = vertices.map((roomVertex) =>
            roomVertex.getLocation().getFloor(),
        );
        const roomCenters = zipInto(
            zip(jsonRooms, vertices),
            roomFloorNumbers,
        ).map(([room, vertex, floor]) =>
            room.center !== null
                ? new BuildingLocation(
                      new LatLng(room.center[1], room.center[0]),
                      floor,
                  )
                : vertex.getLocation(),
        );

        const optRoomEntrances = extractOption(
            jsonRooms.map((room) =>
                extractOption(
                    room.vertices.map((vertexStringId) =>
                        fromMap(vertexNameMapping, vertexStringId),
                    ),
                ).andThen((vertexIds) =>
                    extractOption(
                        vertexIds
                            .map((vertexId) =>
                                navigationGraph.getVertex(vertexId),
                            )
                            .map((vertices) =>
                                vertices.map((vertex) => vertex.getLocation()),
                            ),
                    ),
                ),
            ),
        );
        if (optRoomEntrances.isNone()) {
            return Err("error managing room entrance vertices");
        }
        const roomEntrances = optRoomEntrances.unwrap();

        const roomsArray = zipInto(
            zipInto(zip(roomNumbers, roomEntrances), jsonRooms),
            roomCenters,
        ).map(([roomNumber, entrances, room, center]) =>
            t(
                roomNumber,
                new Room(
                    entrances,
                    roomNumber,
                    room.names ?? [],
                    room.outline,
                    center,
                    room.area ?? 0,
                    room.tags ?? [],
                ),
            ),
        );
        return Ok(new Map(roomsArray));
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
     * Get the room with the specified room number if it exists
     */
    public getRoom(roomNumber: string): Option<Room> {
        return fromMap(this.rooms, roomNumber);
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
        return definition
            .getLocation()
            .getEntrances()
            .map((entrance) => this.getClosestVertex(entrance));
    }

    /**
     * Run Dijkstra's algorithm on all exits from a definition
     * @param src Definition to run Dijkstra's algorithm on
     * @returns Results of running on each exit and the exit vertex IDs. See also `Graph.dijkstra`
     */
    private definitionDijkstra(
        src: GeocoderDefinition,
    ): [Map<number, number>, Map<number, number | null>, number][] {
        const entrances = this.entranceVertexIds(src);
        return zipInto(
            entrances.map((exitId) => this.graph.dijkstra(exitId)),
            entrances,
        );
    }

    /**
     * Find the best path from `src` to `dest`
     * @param src Definition to start from
     * @param dest Definition to end at
     * @returns Path from `src` to `dest` with the lowest total weight, if any exists, as an array of vertex IDs
     */
    public findBestPath(
        src: GeocoderDefinition,
        dest: GeocoderDefinition,
    ): Option<number[]> {
        const destEntrances = this.entranceVertexIds(dest);

        const results = this.definitionDijkstra(src);
        const pathOptions = flatten(
            results.map(([dist, prev, exit]) =>
                destEntrances.map((entrance) =>
                    t(
                        fromMap(dist, entrance).unwrapOr(Infinity),
                        prev,
                        entrance,
                        exit,
                    ),
                ),
            ),
        );
        if (pathOptions.length === 0) {
            // Either src or dest had no entrances
            return None;
        }

        const [shortestDistance, prev, destVertex, srcVertex] =
            pathOptions.reduce((best, current) =>
                current[0] < best[0] ? current : best,
            );
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
    public findBestPathLength(
        src: GeocoderDefinition,
        dest: GeocoderDefinition,
    ): Option<number> {
        const destEntrances = this.entranceVertexIds(dest);
        const results = this.definitionDijkstra(src);
        const distances = flatten(
            results.map(([dist]) =>
                destEntrances.map((entrance) =>
                    fromMap(dist, entrance).unwrapOr(Infinity),
                ),
            ),
        );
        return distances.length > 0 ? Some(Math.min(...distances)) : None;
    }

    /**
     * Get the color to use when rendering a vertex
     * @returns Hex color code, eg. "#0000ff" for blue
     */
    private static vertexColor(vertex: Vertex): string {
        return vertex.hasTag(VertexTag.Stairs) ||
            vertex.hasTag(VertexTag.Elevator)
            ? "#0000ff"
            : "#00ff00";
    }

    /**
     * Create a layer with vertices, edges, and clock location popup for one floor
     * @param floor Floor to create the dev layer for
     */
    public createDevLayerGroup(
        floor: string,
    ): Result<LSomeLayerWithFloor, string> {
        // Create layer showing points and edges
        const devLayer = new LLayerGroupWithFloor([], {
            floorNumber: floor,
        });
        for (const [pName, qName] of this.edges) {
            const resP = fromMap(this.vertexStringToId, pName).andThen((pId) =>
                this.graph.getVertex(pId),
            );
            if (resP.isNone()) {
                return Err(
                    `could not find edge start vertex ${pName} while constructing dev layer`,
                );
            }
            const p = resP.unwrap();

            const resQ = fromMap(this.vertexStringToId, qName).andThen((qId) =>
                this.graph.getVertex(qId),
            );
            if (resQ.isNone()) {
                return Err(
                    `could not find edge end vertex ${qName} while constructing dev layer`,
                );
            }
            const q = resQ.unwrap();

            if (
                p.getLocation().getFloor() === floor &&
                q.getLocation().getFloor() === floor
            ) {
                const pLoc = p.getLocation();
                const qLoc = q.getLocation();
                polyline([pLoc.getXY(), qLoc.getXY()]).addTo(devLayer);
            }
        }

        for (const [vertexName, vertexId] of this.vertexStringToId.entries()) {
            const resVertex = this.graph.getVertex(vertexId);
            if (resVertex.isNone()) {
                return Err(
                    `could not find vertex ${vertexName} while constructing dev layer`,
                );
            }
            const vertex = resVertex.unwrap();
            if (vertex.getLocation().getFloor() === floor) {
                const color = MapData.vertexColor(vertex);
                const location = vertex.getLocation().getXY();
                circle(vertex.getLocation().getXY(), {
                    radius: 1,
                    color: color,
                })
                    .bindPopup(
                        `${vertexName} (${vertexId})<br/>${location.lng}, ${location.lat}`,
                    )
                    .addTo(devLayer);
            }
        }

        return Ok(devLayer);
    }

    /**
     * Create layer groups displaying a path, one for each floor of a building
     * @param path The path to create a group for
     */
    public createLayerGroupsFromPath(
        path: number[],
    ): Result<Set<LSomeLayerWithFloor>, string> {
        const layers = new Map();
        let last = path[0];

        for (const vert of path) {
            const resP = this.graph.getVertex(last);
            if (resP.isNone()) {
                return Err(
                    `could not find vertex with id ${last} while constructing a layer group from a path`,
                );
            }
            const p = resP.unwrap();

            const resQ = this.graph.getVertex(vert);
            if (resQ.isNone()) {
                return Err(
                    `could not find vertex with id ${vert} while constructing a layer group from a path`,
                );
            }
            const q = resQ.unwrap();

            const pLoc = p.getLocation();
            const qLoc = q.getLocation();
            const pFloor = pLoc.getFloor();
            const qFloor = qLoc.getFloor();

            if (pFloor === qFloor) {
                // Same floor, draw path from p to q
                if (!layers.has(pFloor)) {
                    layers.set(
                        pFloor,
                        new LLayerGroupWithFloor([], { floorNumber: pFloor }),
                    );
                }
                polyline([pLoc.getXY(), qLoc.getXY()], {
                    color: "#ff0000",
                }).addTo(layers.get(pFloor));
            } else {
                // Different floor, change floors
                if (!layers.has(pFloor)) {
                    layers.set(
                        pFloor,
                        new LLayerGroupWithFloor([], { floorNumber: pFloor }),
                    );
                }

                if (!layers.has(qFloor)) {
                    layers.set(
                        qFloor,
                        new LLayerGroupWithFloor([], { floorNumber: qFloor }),
                    );
                }

                // TODO: Add proper floor indexing so we don't have to hope that floors are integers
                const pFloorNumber = parseInt(pFloor);
                const qFloorNumber = parseInt(qFloor);

                // These icons aren't actually stairs, but they look close enough to get the idea across
                // They also look much nicer than my poor attempt at creating a stair icon
                const iconClass =
                    qFloorNumber < pFloorNumber
                        ? "fas fa-sort-amount-up-alt"
                        : "fas fa-sort-amount-down-alt";
                const stairIcon = divIcon({
                    html: <i className={iconClass} />,
                    className: "icon nav",
                });
                marker(pLoc.getXY(), { icon: stairIcon }).addTo(
                    layers.get(pFloor),
                );
                marker(qLoc.getXY(), { icon: stairIcon }).addTo(
                    layers.get(qFloor),
                );
            }
            last = vert;
        }

        return Ok(new Set(layers.values()));
    }

    /**
     * Finds the closest vertex to `location` on the same floor as `location`
     * @param location Location to find the closest vertex to
     * @returns ID of the closest vertex
     */
    private getClosestVertex(location: BuildingLocation): number {
        const idVertexToIdDistance2 = function (
            idVertex: [number, Vertex],
        ): [number, Option<number>] {
            const [id, vertex] = idVertex;
            return [id, vertex.getLocation().distance2To(location)];
        };

        const [closestId, _distance] = this.graph
            .getIdsAndVertices()
            .map(idVertexToIdDistance2)
            .filter(([_id, distance]) => distance.isSome())
            .map(([id, distanceOption]) => [id, distanceOption.unwrap()])
            .reduce(([minimumId, minimumDistance], [id, distance]) =>
                distance < minimumDistance
                    ? [id, distance]
                    : [minimumId, minimumDistance],
            );

        return closestId;
    }
}
