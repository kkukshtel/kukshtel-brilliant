import startGame, { Anchor } from "kaplay"
import { clearDrag, curDraggin } from "./components/drag";
import { createWall } from "./prims/wall";
import { createRoom, setRoomEnabled } from "./prims/room";

export enum Direction {
    North,
    South,
    East,
    West
}

export const roomDim = 200;
export const roomRowLength = 5;
export const k = startGame();
export const backgroundColor = k.color(20,20,20);

k.setBackground(backgroundColor.color);
k.debug.log(k.VERSION);

//look at 
/*
    linejoin
    raycastObject
*/
//linejoindrag


export let rooms = [];
let roomStartX = (k.width() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2
let roomStartY = (k.height() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2

export let walls = [];
let center = Math.floor(roomRowLength / 2);
const mainRoomIndex = center * roomRowLength + center;

//create the rooms
for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let roomCenter = k.vec2(roomStartX + x * roomDim, roomStartY + y * roomDim);
        let room = createRoom(k,roomCenter.x, roomCenter.y,x,y)
        rooms.push(room);
        let roomIndex = y * roomRowLength + x;
        let isMainRoom = roomIndex === mainRoomIndex;
        room.isReflectedRoom = !isMainRoom;
        room.isMainRoom = isMainRoom;
        setRoomEnabled(k,room,isMainRoom);
        // if(!isMainRoom)
        // {
        // }
    }
}

//create the walls
let wallWidth = 8;
let wallLengh = roomDim - wallWidth * 2;
for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let room = rooms[Math.floor(y * roomRowLength + x)];
        // bottom
        let bottom = createWall(k,room.right() - wallWidth, room.bottom() - wallWidth / 2, wallLengh , wallWidth, 180);
        walls.push(bottom);
        //right
        let right = createWall(k,room.right() - wallWidth / 2, room.top() + wallWidth, wallLengh, wallWidth, 90);
        walls.push(right);

        if(x == center)
        {
            if( y == center - 1)
            {
                //this is the bottom wall that forms the top of the main room
                bottom.setAsMainRoomWall(Direction.North);
            }
            if(y == center)
            {
                //this is the bottom wall of the main room
                bottom.setAsMainRoomWall(Direction.South);

                //this is the right wall in the main room
                right.setAsMainRoomWall(Direction.East);
            } 
        }

        if(y == center && x == center - 1)
        {
            //this is the right wall that forms the left wall of the main room
            right.setAsMainRoomWall(Direction.West);
        }

        if(y == 0)
        {
            //top
            walls.push(createWall(k,room.left() + wallWidth, room.top() + wallWidth / 2, wallLengh, wallWidth, 0));
        }
        if(x == 0)
        {
            //left
            walls.push(createWall(k,room.left() + wallWidth / 2, room.bottom() - wallWidth , wallLengh, wallWidth, 270));
        }
    }
}



export const mainRoom = rooms[mainRoomIndex];
const mainAdjacentRooms = [
    mainRoom.northRoom(),
    mainRoom.southRoom(),
    mainRoom.eastRoom(),
    mainRoom.westRoom()
];
//make sure all the main room stuff is on "top"
k.readd(mainRoom);
walls.forEach(wall => {
    if(wall.isMainRoomWall)
    {
        k.readd(wall);
    }
});
export const player = mainRoom.addPlayer();
mainRoom.addObject();

let mainRoomWallState = {
    [Direction.North] : false, 
    [Direction.South] : false, 
    [Direction.East] : false, 
    [Direction.West] : false, 
}
export function updateMainRoomWallState(wall)
{
    mainRoomWallState[wall.mainRoomWallDirection] = wall.reflecting;
    //can set adjacents easily
    setRoomEnabled(k,mainRoom.northRoom(),mainRoomWallState[Direction.North]);
    setRoomEnabled(k,mainRoom.southRoom(),mainRoomWallState[Direction.South]);
    setRoomEnabled(k,mainRoom.eastRoom(),mainRoomWallState[Direction.East]);
    setRoomEnabled(k,mainRoom.westRoom(),mainRoomWallState[Direction.West]);

    //kind of hacky way to toggle the walls on/off based on mirror state
    //could potentialyl instead raycast to the distant objects and toggle on/off as part of how the ray collides
    rooms.forEach(room => {
        if(room.isMainRoom || mainAdjacentRooms.includes(room) ){return;} //we handle these above 
        setRoomEnabled(k,room,false);
        if (
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.South] && room.xIndex === mainRoom.xIndex) ||
            (mainRoomWallState[Direction.East] && mainRoomWallState[Direction.West] && room.yIndex === mainRoom.yIndex) ||
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.East] && room.xIndex >= mainRoom.xIndex && room.yIndex <= mainRoom.yIndex) ||
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.West] && room.xIndex <= mainRoom.xIndex && room.yIndex <= mainRoom.yIndex) ||
            (mainRoomWallState[Direction.South] && mainRoomWallState[Direction.East] && room.xIndex >= mainRoom.xIndex && room.yIndex >= mainRoom.yIndex) ||
            (mainRoomWallState[Direction.South] && mainRoomWallState[Direction.West] && room.xIndex <= mainRoom.xIndex && room.yIndex >= mainRoom.yIndex)
        ) {
            setRoomEnabled(k, room, true);
        }

        room.getWalls().forEach(wall => {
            if(wall.isMainRoomWall){return;}
            wall.setVisible(false);
        });
    });

    //turn off all walls except main room walls
    rooms.forEach(room => {
        room.getWalls().forEach(wall => {
            if(wall.isMainRoomWall){return;}
            wall.setVisible(false);
        });
    });

    //turn on all enabled walls
    rooms.forEach(room => {
        if(room.isMainRoom || !room.enabled) return;
        room.getWalls().forEach(wall => {
            if(!wall.isMainRoomWall)
            {
                wall.setVisible(true);
            }
        });
    });
}

// var missedLines = [];
// k.onUpdate(() => {
//     missedLines.forEach(line => {
//         k.drawLine(
//             line
//         )
//     });
// });


// player.checkCollision()
// Check if someone is picked
k.onMousePress(() => {
    if (curDraggin) {
        return;
    }
    // Loop all objects in reverse, so we pick the topmost one
    for (const obj of k.get("drag").reverse()) {
        // If mouse is pressed and mouse position is inside, we pick
        if (obj.isHovering() && obj.draggable) {
            obj.pick();
            break;
        }
    }
});

// Drop whatever is dragged on mouse release
k.onMouseRelease(() => {
    if (curDraggin) {
        curDraggin.trigger("dragEnd");
        clearDrag();
    }
});





//raycast
function laser() {
    return {
        draw() {
            k.drawTriangle({
                p1: k.vec2(-16, -16),
                p2: k.vec2(16, 0),
                p3: k.vec2(-16, 16),
                pos: k.vec2(0, 0),
                color: this.color,
            });
            // if (this.showRing || this.is("turn")) {
            //     k.drawCircle({
            //         pos: k.vec2(0, 0),
            //         radius: 28,
            //         outline: {
            //             color: k.RED,
            //             width: 4,
            //         },
            //         fill: false,
            //     });
            // }
            k.debug.log(-this.angle);
            k.pushTransform();
            k.pushRotate(-this.angle);
            const MAX_TRACE_DEPTH = 3;
            const MAX_DISTANCE = 400;
            let origin = this.pos;
            let direction = k.Vec2.fromAngle(this.angle).scale(MAX_DISTANCE);
            let traceDepth = 0;
            while (traceDepth < MAX_TRACE_DEPTH) {
                const hit = k.raycast(origin, direction, ["laser"]);
                if (!hit) {
                    k.drawLine({
                        p1: origin.sub(this.pos),
                        p2: origin.add(direction).sub(this.pos),
                        width: 1,
                        color: this.color,
                    });
                    break;
                }
                const pos = hit.point.sub(this.pos);
                // Draw hit point
                k.drawCircle({
                    pos: pos,
                    radius: 4,
                    color: this.color,
                });
                // Draw hit normal
                k.drawLine({
                    p1: pos,
                    p2: pos.add(hit.normal.scale(20)),
                    width: 1,
                    color: k.BLUE,
                });
                // Draw hit distance
                k.drawLine({
                    p1: origin.sub(this.pos),
                    p2: pos,
                    width: 1,
                    color: this.color,
                });
                // Offset the point slightly, otherwise it might be too close to the surface
                // and give internal reflections
                origin = hit.point.add(hit.normal.scale(0.001));
                // Reflect vector
                direction = direction.reflect(hit.normal);
                traceDepth++;
            }
            k.popTransform();
        },
        showRing: false,
    };
}
// const ray = k.add([
//     k.pos(854, 442),
//     k.rotate(-60),
//     k.anchor("center"),
//     k.rect(64, 64),
//     k.area(),
//     laser(),
//     k.color(k.RED),
//     k.opacity(0.0),
//     "laser",
// ]);