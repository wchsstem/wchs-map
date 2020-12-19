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
        this.adjList.get(p).push([q, weight]);
        this.adjList.get(q).push([p, weight]);
    }

    getVertex(p: K): V {
        return this.vertices.get(p);
    }

    getIdsAndVertices(): [K, V][] {
        return [...this.vertices.entries()];
    }

    getNeighbors(v: K): Array<K> {
        let result = [];
        for (const u of this.adjList.get(v)) {
            result.push(u[0]);
        }
        return result;
    }

    getWeight(v: K, u: K): number {
        for (const neighbor of this.adjList.get(v)) {
            if (neighbor[0] === u) {
                return neighbor[1];
            }
        }
        return null;
    }

    dijkstra(source: K): [Map<K, number>, Map<K, K>] {
        let q: K[] = [];
        let dist: Map<K, number> = new Map();
        let prev: Map<K, K> = new Map();

        for (const v of this.adjList.keys()) {
            dist.set(v, Infinity);
            prev.set(v, undefined);
            q.push(v);
        }
        dist.set(source, 0);

        while (q.length !== 0) {
            let u = null;
            for (const K of q) {
                if (dist.get(K) < dist.get(u) || u === null) {
                    u = K;
                }
            }

            // Remove u from q
            q.splice(q.indexOf(u), 1);

            for (const v of this.getNeighbors(u)) {
                const alt = dist.get(u) + this.getWeight(v, u);
                if (alt < dist.get(v)) {
                    dist.set(v, alt);
                    prev.set(v, u);
                }
            }
        }

        return [dist, prev];
    }

    toString(): String {
        let result = "";

        const vertices = this.adjList.keys();
        for (const v of vertices) {
            let row = `${v} ->`;

            const connected = this.adjList.get(v);
            for (const w of connected) {
                row = `${row} ${w}`;
            }

            result = `${result}${row}\n`;
        }

        return result;
    }
}