import { Option, Some, None } from "@hqoss/monads";
import MiniSearch from "minisearch";

export class GeocoderSuggestion {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class GeocoderDefinition<T> {
    /** Name of the location. Displayed to the user and the main factor in search. Must be unique. */
    public readonly name: string;
    /** Alternate names for the location, not including its main name. Not displayed to the user, but used in search. */
    public readonly alternateNames: string[];
    /** Description for the location. Displayed to the user and used in search. */
    public readonly description: string;
    /** Tags for the location. May be displayed to the user and used in search. */
    public readonly tags: string[];
    /** Point where this location is located. */
    public readonly location: T;

    constructor(name: string, alternateNames: string[], description: string, tags: string[], location: T) {
        this.name = name;
        this.alternateNames = alternateNames;
        this.description = description;
        this.tags = tags;
        this.location = location;
    }
}

/**
 * Set of `GeocoderDefinition`s used to manage a `Geocoder`. Create one of these and fill it with initial definitions,
 * then add it to the geocoder with `Geocoder.addDefinitionSet`. This will add new definitions to the geocoder and leave
 * a reference to the geocoder in the definition set. If more definitions are added, this reference will be used to
 * update the geocoder. If the definition set is already linked to a geocoder, `Geocoder.addDefinitionSet` will return
 * false and not update any definitions or references.
 */
export class GeocoderDefinitionSet<T> {
    private definitions: GeocoderDefinition<T>[];
    private names: Set<string>;
    private geocoder: Option<Geocoder<T>>;

    private constructor(definitions: GeocoderDefinition<T>[], names: Set<string>) {
        this.definitions = definitions;
        this.names = names;
    }

    public static fromDefinitions<U>(definitions: GeocoderDefinition<U>[]): Option<GeocoderDefinitionSet<U>> {
        const namesSoFar: Set<string> = new Set();
        for (const definition of definitions) {
            if (namesSoFar.has(definition.name)) {
                // Duplicate names are not allowed
                return None;
            }
            namesSoFar.add(definition.name);
        }

        return Some(new GeocoderDefinitionSet(definitions, namesSoFar));
    }

    public addDefinition(definition: GeocoderDefinition<T>) {
        this.geocoder.match({
            some: geocoder => {
                geocoder.addDefinition(definition);
                this.internalNewAddDefinition(definition);
            },
            none: () => {
                if (!this.names.has(definition.name)) {
                    this.internalNewAddDefinition(definition);
                }
            }
        });
    }

    private internalNewAddDefinition(definition: GeocoderDefinition<T>) {
        this.definitions.push(definition);
        this.names.add(definition.name);
    }

    public getDefinitions(): GeocoderDefinition<T>[] {
        return this.definitions;
    }

    public getNames(): Set<string> {
        return this.names;
    }

    /**
     * Saves a reference to a `Geocoder`. It will be used to update the geocoder if this definition set gets a new
     * definition. If there is already a stored reference, it will not be updated and this will return `false`.
     * @param geocoder The geocoder to save a reference to
     * @returns `true` if the reference was saved, `false` if the reference was not saved because there already was one
     */
    public setGeocoder(geocoder: Geocoder<T>): boolean {
        if (this.geocoder) {
            return false;
        }
        this.geocoder = Some(geocoder);
        return true;
    }
}

export class Geocoder<T> {
    private search: MiniSearch;
    private definitionsByName: Map<string, GeocoderDefinition<T>>;
    private allNames: Set<string>;

    constructor() {
        this.search = new MiniSearch({
            idField: "name",
            fields: ["name", "alternateNames", "description", "tags"],
            storeFields: ["name"],
            searchOptions: {
                prefix: true,
                boost: {
                    name: 2
                }
            }
        });
        this.definitionsByName = new Map();
        this.allNames = new Set();
    }

    public addDefinitionSet(definitionSet: GeocoderDefinitionSet<T>): boolean {
        if (!definitionSet.setGeocoder(this)) {
            // Definition set is already linked to a geocoder
            return false;
        }

        const newDefinitions = definitionSet.getDefinitions().filter(definition => !this.allNames.has(definition.name));
        newDefinitions.forEach(definition => this.definitionsByName.set(definition.name, definition));
        this.search.addAll(newDefinitions);
        definitionSet.getNames().forEach(name => this.allNames.add(name));

        return true;
    }

    public addDefinition(definition: GeocoderDefinition<T>): boolean {
        if (this.allNames.has(definition.name)) {
            // Not new
            return false;
        }

        this.definitionsByName.set(definition.name, definition);
        this.search.add(definition);
        this.allNames.add(definition.name);
        
        return true;
    }

    public getSuggestionsFrom(query: string): GeocoderSuggestion[] {
        return this.search.search(query)
            .map(searchResult => new GeocoderSuggestion(searchResult.name));
    }

    public getDefinitionFromName(name: string): Option<GeocoderDefinition<T>> {
        const definitionResult = this.definitionsByName.get(name);
        if (!definitionResult) { return None; }
        return Some(definitionResult);
    }
}
