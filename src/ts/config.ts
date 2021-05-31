// Icons

import { DefinitionTag } from "./Geocoder";
import { VertexTag } from "./Vertex";

// TODO: Wow these icons are bad. Get new ones.
/**
 * Array of pairs, `[tag, icon]`. A vertex's icon should be first icon paired with a tag it has.
 */
export const ICON_FOR_VERTEX_TAG: [VertexTag, string][] = [
    [VertexTag.Up, "\uf885"], // fa-sort-amount-up-alt
    [VertexTag.Down, "\uf884"], // fa-sort-amount-down-alt
    [VertexTag.Stairs, "\uf039"], // fa-align-justify
    [VertexTag.Elevator, "\uf52a"], // fa-door-closed
];

/**
 * Array of pairs, `[tag, icon]`. A room's icon should be first icon paired with a tag it has.
 */
export const ICON_FOR_ROOM_TAG: [DefinitionTag, string][] = [
    [DefinitionTag.WomenBathroom, "\uf182"], // fa-female
    [DefinitionTag.MenBathroom, "\uf183"], // fa-male
    [DefinitionTag.UnknownBathroom, "\uf7d8"], // fa-toilet
    [DefinitionTag.EC, "\uf0e7"], // fa-bolt
    [DefinitionTag.BSC, "\uf71e"], // fa-toilet-paper
    [DefinitionTag.WF, "\uf043"], // fa-tint
    [DefinitionTag.HS, "\ue06b"], // fa-pump-soap
    [DefinitionTag.BleedControl, "\uf462"], // fa-band-aid
    [DefinitionTag.AED, "\uf21e"], // fa-heartbeat
    [DefinitionTag.AHU, "\uf72e"], // fa-wind
    [DefinitionTag.IDF, "\uf6ff"], // fa-network-wired
    [DefinitionTag.ERU, "\uf128"], // fa-question
    [DefinitionTag.CP, "\uf023"]
];

/** CSS font string for icons */
export const ICON_FONT = "900 14px \"Font Awesome 5 Free\"";

// Labels

/** Spacing in pixels between each line in multiline map labels */
export const LABEL_LINE_SPACING_PX = 3;

/** CSS font string for map labels */
export const LABEL_FONT = "12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif";

/** Minimum distance in pixels between two map labels */
export const LABEL_MIN_SPACING_PX = 3;

// Navigation

/** Edge weight for edge representing going up or down stairs in the navigation graph */
export const STAIR_WEIGHT = 10;

// Location

/**
 * Distance in school coordinate units that a user must move for their location to be updated; prevents random noise in
 * GPS signal from causing the dot to jump around when the user is sitting still
 */
export const MOVEMENT_SENSITIVITY = 10;

// Settings

/**
 * Indicates the control type that should be used for a certain setting.
 * Key:
 *  - dropdown: dropdown to choose between the finite set of options specified in `DROPDOWN_DATA`
 */
export const SETTING_INPUT_TYPE: Map<string, string> = new Map([
    ["bathroom-gender", "dropdown"]
]);

/**
 * Indicates the finite set of dropdown options in the order they should be displayed.
 */
export const DROPDOWN_DATA: Map<string, [string, string][]> = new Map([
    ["bathroom-gender", [["", "no-selection"], ["Man", "m"], ["Woman", "w"]]]
]);

/**
 * Defines the order and contents of sections in the settings menu. The first entry of each element is the title of the
 * section, and the second is a list of the options available in that section.
 */
export const SETTING_SECTIONS: [string, string[]][] = [
    ["Personal", ["bathroom-gender"]],
    ["Visibility", ["show-closed", "show-infrastructure", "show-emergency", "hiding-location"]],
    ["Advanced", ["synergy", "dev", "logger", "show-markers"]]
];

export const NAME_MAPPING = new Map([
    ["bathroom-gender", "Restroom Gender"],
    ["synergy", "Enable Synergy Panel (alpha)"],
    ["dev", "Developer Mode"],
    ["hiding-location", "Hide Location Dot"],
    ["show-closed", "Show Closed Room Icons"],
    ["show-infrastructure", "Show Infrastructure Icons"],
    ["show-emergency", "Show Emergency Icons"],
    ["logger", "Show Logger"],
    ["show-markers", "Show Markers"]
]);


// Tags

export const INFRASTRUCTURE_TAGS: Set<DefinitionTag> = new Set([
    DefinitionTag.BSC,
    DefinitionTag.EC,
    DefinitionTag.AHU,
    DefinitionTag.IDF,
    DefinitionTag.MDF,
    DefinitionTag.ERU,
    DefinitionTag.CP
]);

export const EMERGENCY_TAGS: Set<DefinitionTag> = new Set([DefinitionTag.AED, DefinitionTag.BleedControl]);
