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
}

// TODO: Make this work offline with caching
export class Synergy {
    private courses: Course[];

    constructor(synergyPage: string) {
        const courses = [];

        let courseNameMatch;
        while ((courseNameMatch = COURSE_NAME_REGEX.exec(synergyPage)) !== null) {
            const period = courseNameMatch[1];
            const name = courseNameMatch[2];
            const roomNumber = ROOM_NUMBER_REGEX.exec(synergyPage)[1];
            const course = new Course(period, name, roomNumber)
            courses.push(course);
        }

        this.courses = courses;
    }

    public getCourses(): Course[] {
        return this.courses;
    }
}