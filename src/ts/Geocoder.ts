import { Option, fromMap, Some, None } from "@nvarner/monads";
import { kdTree } from "kd-tree-javascript";
import MiniSearch from "minisearch";
import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { t } from "./utils";

export class GeocoderSuggestion {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export interface GeocoderDefinition {
    /**
     * Displayed to the user and the main factor in search. Must be unique among definitions.
     */
    getName(): string;

    /*
     * Not displayed to the user, but used in search.
     */
    getAlternateNames(): string[];

    /**
     * Displayed to the user and used in search.
     */
    getDescription(): string;

    /**
     * May be displayed to the user and used in search.
     */
    getTags(): DefinitionTag[];

    hasTag(tag: DefinitionTag): boolean;

    /**
     * Returns a new definition with an extra alternate name added. Does not modify the object on which it is called.
     */
    extendedWithAlternateName(name: string): GeocoderDefinition;

    getLocation(): BuildingLocationWithEntrances;
}

/** Tag which may be present on a definition */
export enum DefinitionTag {
    /**
     * Location is closed to everyone. Should not be used on rooms when expected limited access is enforced (eg.
     * electrical closets aren't closed just because you can't enter them).
     */
    Closed = "closed",
    /** Bathroom for women */
    WomenBathroom = "women-bathroom",
    /** Bathroom for men */
    MenBathroom = "men-bathroom",
    /** Bathroom gender currently unknown */
    UnknownBathroom = "unknown-bathroom",
    /** Bathroom Supply Closet */
    BSC = "bsc",
    /** Water Fountain */
    WF = "wf",
    /** Electrical Closet */
    EC = "ec",
    /** Water Fountain */
    EF = "wf",
    /** Hand Sanitizing station */
    HS = "hs",
    /** Emergency Bleeding Control kits, installed in case of school shooting or similar event */
    BleedControl = "bleed-control",
    /** Defibrillator */
    AED = "aed",
    /** Air Handling Unit (HVAC room that blows air around) */
    AHU = "ahu",
    /** Intermediate Distribution Frame (support room for Internet and/or telephones) */
    IDF = "idf",
    /** Main Distribution Frame (main room for Internet and/or telephones) */
    MDF = "mdf",
    /** ERU, unknown meaning but likely HVAC-related; some doors are labeled as ERUs */
    ERU = "eru",
    /** Control Panel, security rooms housing a control panel and other such equipment */
    CP = "cp"
}

export class Geocoder {
    private readonly search: Promise<MiniSearch>;
 
    private readonly definitionsByName: Map<string, GeocoderDefinition>;
    /**
     * Definitions indexed by alternate names. They are not guaranteed to be unique, so some definitions may be
     * overwritten. This should be used as a backup only if `definitionsByName` does not contain a requested name.
     */
    private readonly definitionsByAltName: Map<string, GeocoderDefinition>;
    private readonly definitionsByLocation: Map<BuildingLocationWithEntrances, GeocoderDefinition>;
    private readonly allNames: Set<string>;
    /** Spatial indices of room center locations, indexed by floor */
    private readonly roomCenterIndices: Map<string, BuildingKDTree>;

    constructor() {
        this.search = (async () => {
            return new MiniSearch({
                idField: "getName",
                fields: ["getName", "getAlternateNames", "getDescription", "getTags"],
                storeFields: ["getName"],
                // Call the function instead of getting the value of a field
                extractField: (definition, fieldName) => definition[fieldName](),
                searchOptions: {
                    prefix: true,
                    boost: {
                        name: 2
                    }
                }
            })
        })();
        this.definitionsByName = new Map();
        this.definitionsByAltName = new Map();
        this.definitionsByLocation = new Map();
        this.allNames = new Set();
        this.roomCenterIndices = new Map();
    }

    /**
     * Adds a definition to the geocoder. Overrides any other definition with the same name, if already added to the
     * geocoder. Returns the definition it replaced, if any.
     */
    public async addDefinition(definition: GeocoderDefinition): Promise<Option<GeocoderDefinition>> {
        // Deal with the existing definition if it exists
        const existing = fromMap(this.definitionsByName, definition.getName())
            .map(existing => {
                this.removeDefinition(existing);
                return existing;
            });

        this.definitionsByName.set(definition.getName(), definition);
        definition.getAlternateNames().forEach(altName => this.definitionsByAltName.set(altName, definition));
        this.definitionsByLocation.set(definition.getLocation(), definition);
        this.allNames.add(definition.getName());
        (await this.search).add(definition);

        const floor = definition.getLocation().getFloor();

        this.updateTree(floor, tree => {
            tree.insert(definitionToKDTreeEntry(definition));
            return tree;
        });

        return existing;
    }

    public async removeDefinition(definition: GeocoderDefinition): Promise<void> {
        this.definitionsByName.delete(definition.getName());

        const newDefinitionsByAltName = [...this.definitionsByAltName]
            .filter(([checkingName, checkingDefinition]) => {
                return !definition.getAlternateNames().includes(checkingName) && definition !== checkingDefinition;
            });
        this.definitionsByAltName.clear();
        for (const [name, definition] of newDefinitionsByAltName) {
            this.definitionsByAltName.set(name, definition);
        }

        this.definitionsByLocation.delete(definition.getLocation());

        this.allNames.delete(definition.getName());

        (await this.search).remove(definition);

        this.updateTree(definition.getLocation().getFloor(), tree => {
            tree.remove(definitionToKDTreeEntry(definition));
            return tree;
        });
    }

    public async getSuggestionsFrom(query: string): Promise<GeocoderSuggestion[]> {
        return (await this.search).search(query)
            // .getName here is a field, not a method, so named because of how minisearch works
            .map(searchResult => new GeocoderSuggestion(searchResult.getName));
    }

    public getDefinitionFromName(name: string): Option<GeocoderDefinition> {
        return fromMap(this.definitionsByName, name)
            .or(fromMap(this.definitionsByAltName, name));
    }

    public updateTree(floor: string, f: (tree: BuildingKDTree) => BuildingKDTree): void {
        const tree = fromMap(this.roomCenterIndices, floor)
            .unwrapOr(new kdTree([], distanceBetween, ["x", "y"]));
        this.roomCenterIndices.set(floor, f(tree));
    }

    /**
     * Gets the definition closest to `location` on the same floor. Uses Euclidean distance.
     */
    public getClosestDefinition(location: BuildingLocationWithEntrances): Option<GeocoderDefinition> {
        const tree = fromMap(this.roomCenterIndices, location.getFloor()).unwrap();
        const [closest] = tree.nearest(locationToKDTreeEntry(location), 1);
        return closest[0].definition;
    }

    /**
     * Gets the definition closest to `origin` based on the provided `distance` function. That function should return
     * the distance between two definitions if possible, or None if not. None is interpreted as meaning there is no way
     * to go between the two definitions. Only looks at definitions satisfying the predicate.
     */
    public getClosestDefinitionToFilteredWithDistance(
        origin: BuildingLocationWithEntrances,
        predicate: (definition: GeocoderDefinition) => boolean,
        distance: (from: BuildingLocationWithEntrances, to: BuildingLocationWithEntrances) => Option<number>
    ): Option<GeocoderDefinition> {
        return [...this.definitionsByLocation.entries()]
            .filter(([_location, definition]) => predicate(definition))
            .map(([location, definition]) => t(distance(origin, location), definition))
            .filter(([distance, _definition]) => distance.isSome())
            .map(([distance, definition]) => t(distance.unwrap(), definition))
            .reduce<Option<[number, GeocoderDefinition]>>((min, curr) => {
                return min.isNone() || curr[0] < min.unwrap()[0] ? Some(curr) : min;
             }, None)
            .map(([_distance, definition]) => definition);
    }
}

interface KDTreeEntry {
    x: number,
    y: number,
    definition: Option<GeocoderDefinition>
}
type BuildingKDTree = kdTree<KDTreeEntry>;

function definitionToKDTreeEntry(definition: GeocoderDefinition): KDTreeEntry {
    const location = definition.getLocation().getXY();
    return {
        x: location.lng,
        y: location.lat,
        definition: Some(definition)
    };
}

function locationToKDTreeEntry(location: BuildingLocationWithEntrances): KDTreeEntry {
    const xy = location.getXY();
    return {
        x: xy.lng,
        y: xy.lat,
        definition: None
    }
}

function distanceBetween(a: KDTreeEntry, b: KDTreeEntry): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}
