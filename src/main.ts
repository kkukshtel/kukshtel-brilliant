import startGame, { Anchor } from "kaplay"
// import {drag} from "./drag";
export const k = startGame()
k.setBackground(20,20,20);

k.debug.log(k.VERSION);

//f1 for outline debug mode

//look at 
/*
    linejoin
    raycastObject
*/
//linejoindrag

const roomDim = 200;
const roomRowLength = 5;

let rooms = [];
let roomStartX = (k.width() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2
let roomStartY = (k.height() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2

let walls = [];

let center = Math.floor(roomRowLength / 2);
const mainRoomIndex = center * roomRowLength + center;

enum Direction {
    North,
    South,
    East,
    West
}

//create the rooms
for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let roomCenter = k.vec2(roomStartX + x * roomDim, roomStartY + y * roomDim);
        let room = createRoom(roomCenter.x, roomCenter.y,x,y)
        rooms.push(room);
        if(y * roomRowLength + x !== mainRoomIndex)
        {
            room.isReflectedRoom = true;
        }
    }
}

//create the walls
let wallWidth = 16;
let wallLengh = roomDim - wallWidth * 2;
for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let room = rooms[Math.floor(y * roomRowLength + x)];
        // bottom
        walls.push(createWall(room.right() - wallWidth, room.bottom() - wallWidth / 2, wallLengh , wallWidth, Direction.South));
        // right
        walls.push(createWall(room.right() - wallWidth / 2, room.top() + wallWidth, wallLengh, wallWidth, Direction.East));
        if(y == 0)
        {
            //top
            walls.push(createWall(room.left() + wallWidth, room.top() + wallWidth / 2, wallLengh, wallWidth, Direction.North));
        }
        if(x == 0)
        {
            //left
            walls.push(createWall(room.left() + wallWidth / 2, room.bottom() - wallWidth , wallLengh, wallWidth, Direction.West));
        }

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

function getRoomInDirectionFromRoom(room, direction : Direction)
{
    let roomIndex = rooms.indexOf(room);
    switch (direction) {
        case Direction.North:
            if(room.X - roomRowLength < 0)
            {
                return null;
            }
            return rooms[roomIndex - roomRowLength];
        case Direction.South:
            if(room.X + roomRowLength >= rooms.length)
            {
                return null;
            }
            return rooms[roomIndex + roomRowLength];
        case Direction.East:
            if(room.x == roomRowLength - 1)
            {
                return null;
            }
            return rooms[roomIndex + 1];
        case Direction.West:
            if(room.x == 0)
            {
                return null;
            }
            return rooms[roomIndex - 1];
        default:
            return null;
    }
}

//function that creates and returns a room
function createRoom(x, y, xindex, yindex)
{
    let newRoom = k.add([
        k.rotate(0),
        k.pos(x, y),
        k.rect(roomDim, roomDim),
        k.color(20,20,20),
        k.area(),
        k.anchor("center"),
        k.outline(3, k.rgb(0, 0, 0)),
        {
            hovered : false,
            xIndex : xindex,
            yIndex : yindex,
            isReflectedRoom : false,
            left() {
                return this.pos.x - roomDim / 2;
            },
            right() {
                return this.pos.x + roomDim / 2;
            },
            top() {
                return this.pos.y - roomDim / 2;
            },
            bottom() {
                return this.pos.y + roomDim / 2;
            },
        }
    ]);

    newRoom.onHover(() => {
        newRoom.hovered = true;
        newRoom.color = k.rgb(40,40,40);
        k.debug.log("hovering over " + newRoom.xIndex + " " + newRoom.yIndex);
    });
    
    newRoom.onHoverEnd(() => {
        newRoom.hovered = false;
        newRoom.color = k.rgb(30,30,30);
    });

    return newRoom;
}

function createPlayer(x,y,owningRoom)
{
    let playerSize = 20;
    let player = k.add([
        k.rotate(0),
        k.pos(x, y),
        drag(),
        // k.drawTriangle({p1 : k.vec2(0, -20), p2 : k.vec2(10, 10), p3 : k.vec2(-10, 10)}),
        k.circle(playerSize),
        k.color(153,50,204),
        k.area(),
        k.anchor("center"),
        k.body(),
        k.outline(3, k.rgb(255, 0, 255)),
        {
            hovered : false,
            owningRoom : owningRoom,
            draggable : !owningRoom.isReflectedRoom
        }
    ]);

    player.onUpdate(() => {
        //left wall
        if(player.pos.x - playerSize  < owningRoom.left())
        {
            player.pos.x = owningRoom.left() + playerSize;
        }
    
        //right wall
        if(player.pos.x + playerSize  > owningRoom.right())
        {
            player.pos.x = owningRoom.right() - playerSize;
        }
    
        //bottom wall
        if(player.pos.y + playerSize  > owningRoom.bottom())
        {
            player.pos.y = owningRoom.bottom() - playerSize;
        }
    
        //top wall
        if(player.pos.y - playerSize  < owningRoom.top())
        {
            player.pos.y = owningRoom.top() + playerSize;
        }
    });

    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return player;
}

function createObject(x,y,rotation,owningRoom)
{
    let triangleHeight = 40;
    let obj = k.add([
        k.rotate(rotation),
        k.pos(x, y),
        drag(),
        // laser(),
        k.polygon([
            k.vec2(0, 0),
            k.vec2(triangleHeight / 2, triangleHeight),
            k.vec2(-triangleHeight / 2, triangleHeight),
        ], {
            colors: [
                k.rgb(128, 0, 0),
                k.rgb(128, 0, 0),
                k.rgb(128, 0, 0),
            ],
        }),
        k.color(153,50,204),
        k.area({ shape: new k.Rect(k.vec2(0,triangleHeight/2), triangleHeight, triangleHeight)}),
        k.anchor("center"),
        k.body(),
        k.outline(3, k.rgb(255, 0, 0)),
        {
            hovered : false,
            draggable : !owningRoom.isReflectedRoom,
        }
    ]);
    

    obj.onUpdate(() => {
        //kaplay pivots dont work for custom polygon shapes
        //so we have to calculate the center of the triangle based on the angle and adjust position from that
        const halfHeight = triangleHeight / 2;
        let centerX, centerY;
        switch (obj.angle) {
            case 0:
                centerX = obj.pos.x;
                centerY = obj.pos.y + halfHeight;
                break;
            case 90: //pointing right
                centerX = obj.pos.x - halfHeight;
                centerY = obj.pos.y;
                break;
            case 180:
                centerX = obj.pos.x;
                centerY = obj.pos.y - halfHeight;
                break;
            case 270:
                centerX = obj.pos.x + halfHeight;
                centerY = obj.pos.y;
                break;
            default:
                console.error("Unsupported angle");
                return;
        }
    
        // Adjust position based on centered bounding box
        if (centerX - halfHeight < owningRoom.left()) 
        {
            obj.pos.x += owningRoom.left() - (centerX - halfHeight);
        }
        if (centerX + halfHeight > owningRoom.right())
        {
            obj.pos.x -= (centerX + halfHeight) - owningRoom.right();
        }
        if (centerY - halfHeight < owningRoom.top())
        {
            obj.pos.y += owningRoom.top() - (centerY - halfHeight);
        }
        if (centerY + halfHeight > owningRoom.bottom())
        {
            obj.pos.y -= (centerY + halfHeight) - owningRoom.bottom();
        }
    
    });


    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return obj;
}

//create an enum type that has options for north/south/east/west


function createWall(x, y, width, height, direction : Direction)
{
    let wall = k.add([
        k.pos(x, y),
        k.anchor("botleft"),
        k.rotate(direction == Direction.East ? 90 : 
                 direction == Direction.South ? 180 :
                 direction == Direction.West ? 270 : 0),
        k.rect(width, height),
        k.color(60,60,60),
        k.area(),
        // k.outline(3, k.rgb(0, 0, 0)),
        k.body({isStatic: true}),
        {
            toggleReflection() {
                this.reflecting = !this.reflecting;
                this.color = this.reflecting ? k.rgb(180,180,0) : k.rgb(60,60,60); 
            }
        },
        {
            reflecting : false,
        },
        "wall",
    ]);

    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return wall;
}

const mainRoom = rooms[mainRoomIndex];
const player = createPlayer(k.width() /2, k.height() / 2, mainRoom);
const obj = createObject(k.width() /2, k.height() / 2, 90, mainRoom);

// player.checkCollision()


k.onClick("wall", (wall) => {
    k.debug.log("clicked wall");
    wall.toggleReflection();
});


// k.onMousePress(() => {
//     const click = k.add([
//         k.circle(4),
//         k.pos(k.mousePos()),
//         k.color(k.YELLOW),
//     ])

//     k.wait(0.2, () => {
//         click.destroy()
//     })
// })
// const scoreLabel = k.add([k.text("100"), k.pos(24, 24)]);

// k.loop(1, () => {
// });

// room.onUpdate(() => {
//     room.angle += 120 * k.dt();
// });

// wall.onMousePress(() => {
// });

// onUpdate(() => {
//     score++;
//     scoreLabel.text = score;
// });



k.loadSprite("bean", "sprites/bean.png")

// k.add([
//     k.pos(500, 100),
//     k.sprite("bean"),
// ])

// k.onClick(() => k.addKaboom(k.mousePos()))



//drag
// Keep track of the current draggin item
let curDraggin = null;

// A custom component for handling drag & drop behavior
function drag() {
    // The displacement between object pos and mouse pos
    let offset = k.vec2(0);

    return {
        // Name of the component
        id: "drag",
        // This component requires the "pos" and "area" component to work
        require: ["pos", "area"],
        pick() {
            // Set the current global dragged object to this
            curDraggin = this;
            offset = k.mousePos().sub(this.pos);
            this.trigger("drag");
        },
        // "update" is a lifecycle method gets called every frame the obj is in scene
        update() {
            if (curDraggin === this) {
                this.pos = k.mousePos().sub(offset);
                this.trigger("dragUpdate");
            }
        },
        onDrag(action) {
            return this.on("drag", action);
        },
        onDragUpdate(action) {
            return this.on("dragUpdate", action);
        },
        onDragEnd(action) {
            return this.on("dragEnd", action);
        },
    };
}


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
        curDraggin = null;
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