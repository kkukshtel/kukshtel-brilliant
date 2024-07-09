import startGame, { Anchor } from "kaplay"
import { createObject } from "./prims/object";
import { createPlayer } from "./prims/player";
import { clearDrag, curDraggin } from "./components/drag";
import { createWall } from "./prims/wall";
import { createRoom } from "./prims/room";

export enum Direction {
    North,
    South,
    East,
    West
}

export const roomDim = 200;
export const roomRowLength = 5;
export const k = startGame();

k.setBackground(20,20,20);
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


        let roomDiff = k.vec2(x - center, y - center);
    }
}

//create the walls
let wallWidth = 8;
let wallLengh = roomDim - wallWidth * 2;
for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let room = rooms[Math.floor(y * roomRowLength + x)];
        // bottom
        walls.push(createWall(k,room.right() - wallWidth, room.bottom() - wallWidth / 2, wallLengh , wallWidth, Direction.South));
        // right
        walls.push(createWall(k,room.right() - wallWidth / 2, room.top() + wallWidth, wallLengh, wallWidth, Direction.East));
        if(y == 0)
        {
            //top
            walls.push(createWall(k,room.left() + wallWidth, room.top() + wallWidth / 2, wallLengh, wallWidth, Direction.North));
        }
        if(x == 0)
        {
            //left
            walls.push(createWall(k,room.left() + wallWidth / 2, room.bottom() - wallWidth , wallLengh, wallWidth, Direction.West));
        }


        //need to set non main room walls to be non interactable

        if(room.isReflectedRoom)
        {
            //toggle off wall interaction
        }
        else
        {
            //this is the main room
        }
    }
}



export const mainRoom = rooms[mainRoomIndex];
mainRoom.addPlayer();
mainRoom.addObject();
// mainRoom.addElement(createPlayer(k,k.width() /2, k.height() / 2,mainRoom));
// mainRoom.addElement(createObject(k,k.width() /2, k.height() / 2, 90,mainRoom));

// const player = createPlayer(k,k.width() /2, k.height() / 2, mainRoom);
// const obj = createObject(k,k.width() /2, k.height() / 2, 90, mainRoom);

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