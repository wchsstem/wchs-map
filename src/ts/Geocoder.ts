import { Option, Some, None, fromMap } from "@nvarner/monads";
import MiniSearch from "minisearch";

export class GeocoderSuggestion {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export interface GeocoderDefinition<L> {
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
    getTags(): string[];

    getLocation(): L;
}

export class Geocoder<L, D extends GeocoderDefinition<L>> {
    private readonly search: MiniSearch;
    private readonly definitionsByName: Map<string, D>;
    /**
     * Definitions indexed by alternate names. They are not guaranteed to be unique, so some definitions may be
     * overwritten. This should be used as a backup only if `definitionsByName` does not contain a requested name.
     */
    private readonly definitionsByAltName: Map<string, D>;
    private readonly definitionsByLocation: Map<L, D>;
    private readonly allNames: Set<string>;

    constructor() {
        this.search = new MiniSearch({
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
        });
        this.definitionsByName = new Map();
        this.definitionsByAltName = new Map();
        this.definitionsByLocation = new Map();
        this.allNames = new Set();
    }

    /**
     * Adds a definition to the geocoder. Overrides any other definition with the same name, if already added to the
     * geocoder. Returns the definition it replaced, if any.
     */
    public addDefinition(definition: D): Option<D> {
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
        this.search.add(definition);

        return existing;
    }

    public removeDefinition(definition: D): void {
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

        this.search.remove(definition);
    }

    public getSuggestionsFrom(query: string): GeocoderSuggestion[] {
        return this.search.search(query)
            // .getName here is a field, not a method, so named because of how minisearch works
            .map(searchResult => new GeocoderSuggestion(searchResult.getName));
    }

    public getDefinitionFromName(name: string): Option<D> {
        return fromMap(this.definitionsByName, name)
            .or(fromMap(this.definitionsByAltName, name));
    }
}
