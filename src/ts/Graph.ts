import { fromMap, None, Option, Some } from "@nvarner/monads";
import { FibonacciHeap, INode } from "@tyriar/fibonacci-heap";

export default class Graph<K, V> {
    private adjList: Map<K, Array<[K, number]>>;
    private vertices: Map<K, V>;

    constructor() {
        this.adjList = new Map();
        this.vertices = new Map();
    }

    addVertex(id: K, value: V) {
        this.adjList.set(id, []);
        this.vertices.set(id, value);
    }

    addEdge(p: K, q: K, weight: number) {
        this.adjList.get(p)!.push([q, weight]);
        this.adjList.get(q)!.push([p, weight]);
    }

    /**
     * Adds a directed edge from p to q with a given weight
     * @param p Vertex to start from
     * @param q Vertex to end on
     * @param weight Weight of the edge
     */
    addDirectedEdge(p: K, q: K, weight: number) {
        this.adjList.get(p)!.push([q, weight]);
    }

    getVertex(p: K): V {
        return this.vertices.get(p)!;
    }

    getIdsAndVertices(): [K, V][] {
        return [...this.vertices.entries()];
    }

    getNeighbors(v: K): K[] {
        return this.adjList.get(v)!.map(u => u[0]);
    }

    getWeight(v: K, u: K): Option<number> {
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

    dijkstra(source: K): [Map<K, number>, Map<K, K | null>] {
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

        return [dist, prev as Map<K, K>];
    }

    toString(): String {
        let result = "";

        for (const v of this.adjList.keys()) {
            let row = `${v} ->`;

            fromMap(this.adjList, v).ifSome(connected => {
                for (const w of connected) {
                    row = `${row} ${w}`;
                }
            });

            result = `${result}${row}\n`;
        }

        return result;
    }
}