// Churchill is 600ft long and 400ft across; portables add to that

import { LatLngBounds } from "leaflet";

// bounds used to just be defined in terms of constants, but due to mistakes made when choosing those constants and
// the subsequent addition of the portables, this was used instead. It should be easier to configure for existing maps,
// but new maps should instead carefully choose a coordinate system such that the bounds fit the aspect ratio of the
// base map image to avoid having to do this.
const WIDTH = 161.31325; // width of 1st floor from Inkscape; arbitrary unit
const HEIGHT = 123.15513; // height of 1nd floor from Inkscape; same unit as width
const SCALE = 3.78;
const PUSH_X = 5;
export const BOUNDS = new LatLngBounds([0, PUSH_X], [SCALE * HEIGHT, (SCALE * WIDTH) + PUSH_X]);

export const MIN_ZOOM = -1;
export const MAX_ZOOM = 3;
