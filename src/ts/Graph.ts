import { fromMap, None, Option, Some } from "@nvarner/monads";
import { FibonacciHeap, INode } from "@tyriar/fibonacci-heap";

type AdjList<K> = Map<K, [K, number][]>;
type Edge<K> = [K, K, number, boolean];

export class Graph<K, V> {
    private readonly adjList: AdjList<K>;
    private readonly vertices: Map<K, V>;

    public constructor(vertices: Map<K, V>, edges: Edge<K>[]) {
        this.vertices = vertices;

        const adjList = new Map([...vertices.keys()].map(key => [key, []] as [K, [K, number][]]));
        edges.forEach(edge => Graph.addEdgeTo(adjList, edge));
        this.adjList = adjList;
    }

    /**
     * Modifies an adjacency list to add an edge
     * @param adjList Adjacency list to add the edge to
     * @param from Vertex to start from
     * @param to Vertex to end on
     * @param weight Weight of the edge
     * @param directed True if the edge should be one-way, false if it should be two-way
     */
    private static addEdgeTo<K>(adjList: AdjList<K>, [from, to, weight, directed]: Edge<K>) {
        adjList.get(from)!.push([to, weight]);
        if (!directed) {
            adjList.get(to)!.push([from, weight]);
        }
    }

    public getVertex(p: K): V {
        return this.vertices.get(p)!;
    }

    /**
     * Get all vertex IDs and their associated vertices
     */
    public getIdsAndVertices(): [K, V][] {
        return [...this.vertices.entries()];
    }

    /**
     * Get vertices that have an edge from `v`
     * @param v ID of the vertex to find the neighbors of
     */
    public getNeighbors(v: K): K[] {
        return this.adjList.get(v)!.map(u => u[0]);
    }

    /**
     * Get the weight of an edge between two vertices
     * @param v ID of the edge's starting vertex
     * @param u ID of the edge's ending vertex
     * @returns `Some(weight)` if the edge exists, `None` if not. Keep in mind that directed edges are one-way, so the
     * order of `u` and `v` can affect the return value.
     */
    public getWeight(v: K, u: K): Option<number> {
        const maybeNeighbors = fromMap(this.adjList, v);
        if (maybeNeighbors.isNone()) {
            return None;
        }
        const neighbors = maybeNeighbors.unwrap();
        const maybeNeighbor = neighbors
            .filter(neighbor => neighbor[0] === u)
            .map(neighbor => neighbor[1]);
        if (maybeNeighbor.length > 0)
            return Some(maybeNeighbor[0]);
        else
            return None;
    }

    /**
     * Run Dijkstra's pathfinding algorithm on the graph
     * @param source ID of the vertex to start from
     * @returns `[totalWeightToVertex, predecessor]`
     *  - `totalWeightToVertex` stores the sum of the weights along the edges from `source` to any vertex in the graph.
     * If the weight is `Infinity`, there does not exist a path from `source` to that vertex.
     *  - `predecessor` represents the vertex before any vertex in the graph along the fastest path from `source`. It
     * can be used to find the path from `source` to any vertex by repeatedly finding the vertex before until reaching
     * `source`. If the predecessor is `null`, the vertex either is `source` or has no path from `source`.
     */
    public dijkstra(source: K): [Map<K, number>, Map<K, K | null>] {
        let dist: Map<K, number> = new Map();
        let prev: Map<K, K | null> = new Map();

        dist.set(source, 0);

        const q: FibonacciHeap<number, K> = new FibonacciHeap();
        const vertexToNode: Map<K, INode<number, K>> = new Map();

        for (const v of this.adjList.keys()) {
            if (v !== source) {
                dist.set(v, Infinity);
                // TODO: Maybe use None?
                prev.set(v, null);
            }
            const node = q.insert(dist.get(v)!, v);
            vertexToNode.set(v, node);
        }

        while (!q.isEmpty()) {
            const u = q.extractMinimum()!.value!;

            for (const v of this.getNeighbors(u)) {
                const vWeight = dist.get(v)!;
                const alt = dist.get(u)! + this.getWeight(u, v).unwrap();
                if (alt < vWeight) {
                    dist.set(v, alt);
                    prev.set(v, u);
                    const node = vertexToNode.get(v)!;
                    q.decreaseKey(node, alt);
                }
            }
        }

        return [dist, prev];
    }

    /**
     * Generate a path of neighboring vertices to a destination from a `prev` map
     * @param src Original start of the path
     * @param dest Destination to find the path to
     * @param prev Map from vertex to previous vertex
     */
    public pathFromPrev(src: K, dest: K, prev: Map<K, K | null>): Option<K[]> {
        if (src === dest) {
            return Some([dest]);
        }

        const prevVertex = prev.get(dest);
        if (!prevVertex) {
            // No path from src to dest
            return None;
        }

        const pathToPrev = this.pathFromPrev(src, prevVertex, prev);
        return pathToPrev.match({
            some: path => Some([dest, ...path]),
            none: None as Option<K[]>
        });
    }
}
