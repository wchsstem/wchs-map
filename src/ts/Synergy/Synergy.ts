import { BuildingGeocoder } from "../BuildingGeocoder";
import { Logger } from "../LogPane/LogPane";
import Room from "../Room";

const COURSE_NAME_REGEX = /course-title.*">([^:]*): ([^<]*)<\//g;
const ROOM_NUMBER_REGEX = /teacher-room.*">Room: ([^<]+)<\//g

export class Course {
    private period: string;
    private name: string;
    private room: Room;

    constructor(period: string, name: string, room: Room) {
        this.period = period;
        this.name = name;
        this.room = room;
    }

    public toString(): string {
        return `Period ${this.period}: ${this.name} in ${this.room.getName()}`;
    }

    public toHtmlLi(): HTMLLIElement {
        const text = document.createTextNode(this.toString());
        const li = document.createElement("li");
        li.appendChild(text);
        return li;
    }

    public getRoom(): Room {
        return this.room;
    }
}

// TODO: Make this work offline
export class Synergy {
    private courses: Course[];

    constructor(synergyPage: string, geocoder: BuildingGeocoder, logger: Logger) {
        const courses = [];

        let courseNameMatch;
        while ((courseNameMatch = COURSE_NAME_REGEX.exec(synergyPage)) !== null) {
            const period = courseNameMatch[1];
            const name = courseNameMatch[2];

            const roomNumberResult = ROOM_NUMBER_REGEX.exec(synergyPage);
            // TODO: Proper error handling
            if (roomNumberResult === null) {
                throw "Invalid page";
            }
            const roomNumber = roomNumberResult[1];
            const room = geocoder.getDefinitionFromName(roomNumber).match({
                some: room => room,
                none: () => {
                    logger.log(`Could not find room number for ${roomNumber}`);
                    return null;
                }
            });
            if (room === null) {
                continue;
            }

            const course = new Course(period, name, room);
            courses.push(course);

            const courseRoom = room.extendedWithAlternateName(course.toString());
            geocoder.addDefinition(courseRoom);
        }

        this.courses = courses;
    }

    public getCourses(): Course[] {
        return this.courses;
    }
}