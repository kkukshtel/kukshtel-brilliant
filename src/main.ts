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

const roomDim = 250;

//function that creates and returns a room
function createRoom(x, y)
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
            // left : owningRoom.pos.x  + roomDim / 2
        }
    ]);

    // note: anchor becomes 0,0 for children
    let off =  roomDim / 2;
    //top
    newRoom.add(createWall(-off,-off, roomDim, 15));
    //right
    newRoom.add(createWall(off,-off, roomDim, 15,  90));
    //bottom
    newRoom.add(createWall(off,off, roomDim, 15, 180));
    //left
    newRoom.add(createWall(-off,off, roomDim, 15, 270));

    newRoom.onHover(() => {
        newRoom.hovered = true;
        newRoom.color = k.rgb(40,40,40);
        // k.debug.log("hovering over room");
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
    let playerDiameter = playerSize * 2;
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
            owningRoom : owningRoom
        }
    ]);

    player.onUpdate(() => {
        //left wall
        if(player.pos.x  < owningRoom.left())
        {
            player.pos.x = owningRoom.left();
        }
    
        //right wall
        if(player.pos.x  > owningRoom.right())
        {
            player.pos.x = owningRoom.right();
        }
    
        //bottom wall
        if(player.pos.y  > owningRoom.bottom())
        {
            player.pos.y = owningRoom.bottom();
        }
    
        //top wall
        if(player.pos.y  < owningRoom.top())
        {
            player.pos.y = owningRoom.top() ;
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

function createObject(x,y,owningRoom)
{
    let triangleHeight = 40;
    let obj = k.add([
        k.rotate(270),
        k.pos(x, y),
        drag(),
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
        // k.anchor(k.vec2(0.0, 0.5)),
        k.body(),
        k.outline(3, k.rgb(255, 0, 0)),
        {
            hovered : false
        }
    ]);

    // object.anchor = k.vec2(0.5, 0.5);

    //we have to buffer this based on where the anchor is for the shape ("top" point)
    obj.onUpdate(() => {
        const halfHeight = triangleHeight / 2;
    
        // get center of triangle based on angle (pivot is at top of triangle) 
        let centerX, centerY;
        switch (obj.angle) {
            case 0: // Pointing up
                centerX = obj.pos.x;
                centerY = obj.pos.y + halfHeight;
                break;
            case 90: // Pointing right
                centerX = obj.pos.x - halfHeight;
                centerY = obj.pos.y;
                break;
            case 180: // Pointing down
                centerX = obj.pos.x;
                centerY = obj.pos.y - halfHeight;
                break;
            case 270: // Pointing left
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

function createWall(x, y, width, height,rotation = 0)
{
    let wall = k.make([
        k.pos(x, y),
        k.anchor("botleft"),
        k.rotate(rotation),
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

const startingRoom = createRoom(k.width() /2, k.height() / 2);
const player = createPlayer(k.width() /2, k.height() / 2, startingRoom);
const obj = createObject(k.width() /2, k.height() / 2, startingRoom);

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
export function drag() {
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
        if (obj.isHovering()) {
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