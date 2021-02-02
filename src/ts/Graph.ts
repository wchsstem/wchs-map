import { fromMap, None, Option, Some } from "monads";

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
        let q: K[] = [];
        let dist: Map<K, number> = new Map();
        let prev: Map<K, K | null> = new Map();

        for (const v of this.adjList.keys()) {
            dist.set(v, Infinity);
            prev.set(v, null);
            q.push(v);
        }
        dist.set(source, 0);

        while (q.length !== 0) {
            // Get the ID of the vertex with the smallest distance
            const u = q.reduce((u, K) => fromMap(dist, K).unwrap() < fromMap(dist, u).unwrap() ? K : u);

            // Remove u from q
            q.splice(q.indexOf(u), 1);

            for (const v of this.getNeighbors(u)) {
                const alt = fromMap(dist, u).unwrap() + this.getWeight(v, u);
                if (alt < fromMap(dist, v).unwrap()) {
                    dist.set(v, alt);
                    prev.set(v, u);
                }
            }
        }

        prev

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