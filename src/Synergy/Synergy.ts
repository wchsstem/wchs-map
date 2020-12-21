import { BuildingLocationWithEntrances } from "../ts/BuildingLocation";
import { GeocoderDefinition, GeocoderDefinitionSet } from "../ts/Geocoder";
import { geocoder } from "../ts/utils";

const COURSE_NAME_REGEX = /course-title.*">([^:]*): ([^<]*)<\//g;
const ROOM_NUMBER_REGEX = /teacher-room.*">Room: ([^<]+)<\//g

export class Course {
    private period: string;
    private name: string;
    private roomNumber: string;

    constructor(period: string, name: string, roomNumber: string) {
        this.period = period;
        this.name = name;
        this.roomNumber = roomNumber;
    }

    public toString(): string {
        return `Period ${this.period}: ${this.name} in room ${this.roomNumber}`;
    }

    public toHtmlLi(): HTMLLIElement {
        const text = document.createTextNode(this.toString());
        const li = document.createElement("li");
        li.appendChild(text);
        return li;
    }

    public getDefinition(): GeocoderDefinition<BuildingLocationWithEntrances> {
        const location = geocoder.getDefinitionFromName(this.roomNumber).unwrap().location;
        console.log(this.name);
        return new GeocoderDefinition(`Period ${this.period}`, [this.name], "", ["course"], location);
    }
}

// TODO: Make this work offline with caching
export class Synergy {
    private courses: Course[];
    private definitionSet: GeocoderDefinitionSet<BuildingLocationWithEntrances>;

    constructor(synergyPage: string) {
        const courses = [];
        const definitions: GeocoderDefinition<BuildingLocationWithEntrances>[] = [];

        let courseNameMatch;
        while ((courseNameMatch = COURSE_NAME_REGEX.exec(synergyPage)) !== null) {
            const period = courseNameMatch[1];
            const name = courseNameMatch[2];
            const roomNumber = ROOM_NUMBER_REGEX.exec(synergyPage)[1];
            const course = new Course(period, name, roomNumber)
            courses.push(course);
            definitions.push(course.getDefinition());
        }

        this.courses = courses;
        // Names should be unique because every class has a unique period number
        this.definitionSet = GeocoderDefinitionSet.fromDefinitions(definitions).unwrap();
        geocoder.addDefinitionSet(this.definitionSet);
    }

    public getCourses(): Course[] {
        return this.courses;
    }
}