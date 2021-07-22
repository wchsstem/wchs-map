# Map Docs
This is a documentation file specific to Churchill's map files (map.json, 1st_floor_inkscape.svg, etc.), not for general
mapping files (like map-schema.json).

## Weight room
Confusingly, the weight room is accessed only in the first floor, but has its own staircase within it leading to a
second floor of the same room cut off from the rest of the second floor. My solution to this problem was to call the
second floor section a separate room, 143Z. Because of the two entrances to the weight room, two parallel paths had to
be created for the staircase to prevent routing through the weight room. These paths are slightly separated to make this
clear, but could be moved so they occupy the same locations.

## Room numbers
### Rooms without numbers
Some rooms may not have a room number. This section attempts to give those rooms a reasonable, unique identifier.

#### Student bathrooms
Student bathrooms should be given a room number in the form of 'B{gender}{floor number}{id}'. The gender should be 'M'
or 'W' for men's and women's rooms, respectively. The id is a unique two-digit ID identifying the bathroom on the floor.
Corresponding bathrooms across multiple floors should share this ID. Corresponding men's and women's rooms should also
share an ID. As a result, each ID will probably have four individual bathrooms sharing it. For bathrooms of unknown
gender, arbitrarily assign A or B as the temporary gender in the room number.

Future possibility: there seem to be Bathroom Supply Closets associated with each bathroom, each of which is associated
with a room number BSC{X} written in marker on the door. Bathroom IDs should be linked to the ID of the BSCs, though not
enough are known at this time to do that correctly for all bathrooms. When BSC numbers are used as IDs, they won't match
between floors, which is acceptable.

Note: these are called "bathrooms" internally so the initial (R) doesn't conflict with the initial of room (R), but
these should be called "restrooms" in the UI.

#### Bathroom Supply Closets (BSCs)
These should be given a room number in the form of 'BSC{id}'. The id should correspond to its given ID if known, or the
floor number with the ID of the bathrooms with which it is associated if not.

#### Courtyards
The courtyards should be given a number in the form of 'CY{id}', where the id is their courtyard number.

#### Non-room points of interest
These are permanent points of interest that are not rooms, like the art gallery across from 278 and 276. They should be
given a room number in the form of 'POI{floor number}{id}', where the id is a unique two-digit ID identifying the POI
on the floor.

Current list of non-room POIs:
 - POI200 (Art Gallery, across from 278 and 276)

##### Water fountains/bottle filling stations
These should be given a room number in the form 'WF{floor number}{id}', where the id is a unique two-digit ID
identifying the water fountain on the floor.

##### Hand sanitizing stations
These should be given a room number in the form 'HS{floor number}{id}', where the id is a unique two-digit ID
identifying the station on the floor.

##### Bleeding control kits
These should be given a room number in the form 'BC{floor number}{id}', where the id is a unique two-digit ID
identifying the station on the floor.

### Unknown room numbers
Some rooms do not have a known room number. This doesn't mean these rooms don't have room numbers, just that they aren't
known to the developers and maintainers of this map. If the numbers for rooms following this scheme are learned, they
should be changed to the correct numbers.

#### Rooms within rooms
For rooms that are clearly part of another room, like individual offices in department offices or rooms within the
locker rooms, they are assigned the room number of the room they are within plus a letter starting from the end of the
alphabet. So, for example, the closet off of 152 is numbered 152Z. This is inspired by the actual numbering convention,
well exemplified in the Office (144) and Counseling (107).

Incomplete list of rooms within rooms with unknown numbers:
 - 124Z
 - 130Y
 - 130Z
 - 139Z
 - 147Z
 - 153Y
 - 153Z
 - 155Z
 - 156Z (may be 157)
 - 157Z
 - 159Z
 - 161Z
 - 163Z (Concessions)
 - 169Z
 - 261Z (MDF)

#### Standalone rooms
For standalone rooms, their room number will be x, followed by their floor number, followed by a unique two digit
number. For example, the attendance office is numbered x100. These rooms should be given an alternate name in map.json
if at all possible, because these room numbers are really placeholders and will probably be confusing for users.

Current list of standalone rooms with unknown numbers:
 - x100 (Attendance Office)
 - x200 (Office)
 - x201 (Storage)
 - x202 (Storage)
 - x203 (Laundry; I don't know why this room exists, but you can see a washer and dryer through a window on the door)

## Vertex IDs
Vertex IDs follow a specific pattern based on their location. The IDs chosen are not important for the mapping software,
but are useful for developers to quickly name and locate vertices.

### IDs starting with 'R'
These are doors for a room or rarely vertices within a room. They are in the form 'R{room number}:{id}', where id is a
unique ID to identify that identifies the particular vertex associated with a room. It is usually 0, as most rooms only
have a single vertex associated with them for their single door.

### IDs starting with 'H'
These are vertices associated with one hallway. They are used for points along the hallway and points not associated
with rooms just off the hallway, chiefly stairs. It uses a custom hallway numbering system that predates the hallway
names. It can be reverse engineered from these vertices. They are in the form 'H{hallway number}:{id}', where id is a
unique ID that identifies the particular vertex associated with a hallway.

### IDs starting with 'I'
These are vertices associated with an intersection between two hallways. They mostly are used to connect two hallways,
but may be used for stairs. They are in the form 'I{hallway a}:{hallway b}:{id}' where hallway a is the intersecting
hallway with the smaller ID, hallway b is the intersecting hallway with the larger ID, and id is a unique ID that
identifies the particular vertex associated with an intersection.

### IDs starting with 'E'
These are entrances and exits from the main school building. They are in the form 'E{id}', where id is a unique ID that
identifies the particular entrance or exit with which the vertex is associated.

## Curved walls
Some walls in the school (Cafeteria/156A, Main Office, Side Gym closets) are curved. SVG supports these curves, so the
outlines look great, but Leaflet does not, so the green highlights do not follow those curves. They just jump from point
to point. To address this issue, extra points were added on these curves so the green highlight followed them well
enough to not be noticed. If you want to edit these curves, you should delete these extra points first, do your edits,
then add them back in.

## Acronym Guessing
Some rooms are labelled with acronyms. These are typically not classrooms and are filed as infrastructure rooms. They
are not usually documented, so I've made educated guesses at their meanings.

### EC: Electrical Closet
This is almost certainly correct, as EC-12/ERU-6 has a sign taped to the door labeling it "Electrical Closet 12".

### BSC: Bathroom Supply Closet
This is likely as student bathrooms are usually adjacent to a BSC. However, there are BSCs not obviously near bathrooms
and staff bathrooms don't seem to be near BSCs.

### AHU: Air Handling Unit
AHU seems to be a common HVAC term referring to the machine that circulates warm/cool air throughout the school. The
varied placement of AHUs throughout the school supports this. In particular, the dualing AHUs at the auditorium match
the auditorium's large size and usual cool temperature, especially compared to the rest of the school.

### ERU: ?
My guess is that ERUs are some type of HVAC room. I've found that ERU can stand for Energy Recovery Unit or Emmisions
Reduction Unit but do not know which, if either, applies here.

### MDF: Main Distribution Frame, IDF: Intermediate Distribution Frame
These are computer networking (and maybe also phone networking) rooms. The MDF is central, and the IDFs improve service
farther from the MDF. These are very common telecommunications acronyms and their placement and number is logical with
respect to them.

### CP: Control Panel, PS: Power Supply, EZM: Zone Expansion Module (?)
Only CP should show up on the map, but all three of these are on door signs. They seem to be acronyms used by Napco
Security. The CP is probably a central controller, PS seems to be backup power, and the EZM allows for more things to
be connected to the security system.
