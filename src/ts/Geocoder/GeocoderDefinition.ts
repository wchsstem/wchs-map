import { BuildingLocationBBox } from "../BuildingLocation/BuildingLocationBBox";
import { BuildingLocationWithEntrances } from "../BuildingLocation/BuildingLocationWithEntrances";
import { DefinitionTag } from "./DefinitionTag";

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

    /** Get some single location that represents */
    getLocation(): BuildingLocationWithEntrances;

    /** Get the smallest bounding box that entirely encloses the definition */
    getBoundingBox(): BuildingLocationBBox;
}
