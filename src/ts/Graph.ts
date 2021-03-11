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
        fromMap(this.adjList, p).unwrap().push([q, weight]);
        fromMap(this.adjList, q).unwrap().push([p, weight]);
    }

    /**
     * Adds a directed edge from p to q with a given weight
     * @param p Vertex to start from
     * @param q Vertex to end on
     * @param weight Weight of the edge
     */
    addDirectedEdge(p: K, q: K, weight: number) {
        fromMap(this.adjList, p).unwrap().push([q, weight]);
    }

    getVertex(p: K): V {
        return fromMap(this.vertices, p).unwrap();
    }

    getIdsAndVertices(): [K, V][] {
        return [...this.vertices.entries()];
    }

    getNeighbors(v: K): K[] {
        return fromMap(this.adjList, v).unwrap().map(u => u[0]);
    }

    getWeight(v: K, u: K): number {
        return fromMap(this.adjList, v)
            .unwrap()
            .filter(neighbor => neighbor[0] === u)
            .map(neighbor => neighbor[1])[0];
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
            const node = q.insert(fromMap(dist, v).unwrap(), v);
            vertexToNode.set(v, node);
        }

        while (!q.isEmpty()) {
            const u = q.extractMinimum()!.value!;

            for (const v of this.getNeighbors(u)) {
                const vWeight = fromMap(dist, v).unwrap();
                const alt = fromMap(dist, u).unwrap() + this.getWeight(u, v);
                if (alt < vWeight) {
                    dist.set(v, alt);
                    prev.set(v, u);
                    const node = fromMap(vertexToNode, v).unwrap();
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