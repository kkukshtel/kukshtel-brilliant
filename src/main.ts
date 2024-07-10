import startGame from "kaplay"
import { clearDrag, curDraggin } from "./components/drag";
import { createWall } from "./prims/wall";
import { createRoom } from "./prims/room";
import { addButton } from "./prims/button";

export enum Direction {
    North,
    South,
    East,
    West
}

export const roomDim = 200;
export const roomRowLength = 5;
export const playerSize = 20;
const wallWidth = 8;

export const k = startGame();
export const backgroundColor = k.color(20,20,20);

/* debug info
addButton(k,"debug",k.vec2(100, 100), () => {
    k.debug.inspect = !k.debug.inspect;
});
addButton(k,"all on",k.vec2(100, 200), () => {
    rooms.forEach(room => {
        room.setEnabled(true);
    });
});
k.debug.log(k.VERSION);
*/

//initial setup
k.setBackground(backgroundColor.color);

export let currentObjectID = 0;
export function getNextObjectID()
{
    return currentObjectID++;
}

//create the rooms
export let rooms = [];
let roomStartX = (k.width() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2;
let roomStartY = (k.height() / 2) - (roomDim * roomRowLength / 2) + roomDim / 2;
let center = Math.floor(roomRowLength / 2);
const mainRoomIndex = center * roomRowLength + center;

for (let y = 0; y < roomRowLength; y++) {
    for (let x = 0; x < roomRowLength; x++) {
        let roomCenter = k.vec2(roomStartX + x * roomDim, roomStartY + y * roomDim);
        let room = createRoom(k,roomCenter.x, roomCenter.y,x,y)
        rooms.push(room);
        let roomIndex = y * roomRowLength + x;
        let isMainRoom = roomIndex === mainRoomIndex;
        room.isReflectedRoom = !isMainRoom;
        room.isMainRoom = isMainRoom;
        //turn all rooms off except main room
        room.setEnabled(isMainRoom);
    }
}

//create the walls
//we create all room's bottom and right walls, then backfill the left and top border walls
//we also designate which room is the center and mark its walls as such so we can toggle them on/off
export let walls = [];
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

//now actually create the starting state of the game
export const mainRoom = rooms[mainRoomIndex];
//setup an initial state for the main room walls
let mainRoomWallState = {
    [Direction.North] : false, 
    [Direction.South] : false, 
    [Direction.East] : false, 
    [Direction.West] : false, 
}
//make sure all the main room stuff is on "top" (this is a kaplay specific thing)
k.readd(mainRoom);
walls.forEach(wall => {
    if(wall.isMainRoomWall)
    {
        k.readd(wall);
    }
});

//create the player and object in the main room
export const player = mainRoom.addPlayer();
mainRoom.addObject();
updateRoomVisibility(); //update all room visibily based on the main room walls (all off to start)
player.pos.x += 0.1; //move the player a bit to tick the update function - otherwise physics offsets them improperly 

//setup for drag handlers
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

// drop whatever is dragged on mouse release
k.onMouseRelease(() => {
    if (curDraggin) {
        curDraggin.trigger("dragEnd");
        clearDrag();
    }
});

// -------------------------------------------------
// everything setup and good to go here! ---------
// -------------------------------------------------



//function to pump the main room wall state into the game
export function updateMainRoomWallState(wall)
{
    mainRoomWallState[wall.mainRoomWallDirection] = wall.reflecting;
    updateRoomVisibility();
}

//toggle the walls on/off based on the main room wall state
function updateRoomVisibility()
{
    //kind of hacky way to toggle the walls on/off based on mirror state
    //could potentially instead raycast to the distant objects and toggle on/off as part of how the ray collides
    rooms.forEach(room => {
        let enabled = false;
        if(room.isMainRoom  ){return;} //we handle these above 
        if (
            //all mirrors
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.South] && mainRoomWallState[Direction.East] && mainRoomWallState[Direction.West]) ||
            
            //adjacent
            (mainRoomWallState[Direction.North] && room.xIndex == mainRoom.xIndex && room.yIndex == mainRoom.yIndex - 1) ||
            (mainRoomWallState[Direction.South] && room.xIndex == mainRoom.xIndex && room.yIndex == mainRoom.yIndex + 1) ||
            (mainRoomWallState[Direction.West] && room.yIndex == mainRoom.yIndex  && room.xIndex == mainRoom.xIndex - 1) ||
            (mainRoomWallState[Direction.East] && room.yIndex == mainRoom.yIndex  && room.xIndex == mainRoom.xIndex + 1) ||
    
            //infinite hor/vert
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.South] && room.xIndex === mainRoom.xIndex) ||
            (mainRoomWallState[Direction.East] && mainRoomWallState[Direction.West] && room.yIndex === mainRoom.yIndex) ||

            //corners
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.East] && room.xIndex == mainRoom.xIndex + 1 && room.yIndex == mainRoom.yIndex - 1) ||
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.West] && room.xIndex == mainRoom.xIndex - 1 && room.yIndex == mainRoom.yIndex - 1) ||
            (mainRoomWallState[Direction.South] && mainRoomWallState[Direction.East] && room.xIndex == mainRoom.xIndex + 1 && room.yIndex == mainRoom.yIndex + 1) ||
            (mainRoomWallState[Direction.South] && mainRoomWallState[Direction.West] && room.xIndex == mainRoom.xIndex - 1 && room.yIndex == mainRoom.yIndex + 1) ||
            
            //back bounces
            (mainRoomWallState[Direction.North] && mainRoomWallState[Direction.East] && mainRoomWallState[Direction.South] && room.xIndex == mainRoom.xIndex + 1) ||
            (mainRoomWallState[Direction.East] && mainRoomWallState[Direction.South] && mainRoomWallState[Direction.West] && room.yIndex == mainRoom.yIndex + 1) ||
            (mainRoomWallState[Direction.South] && mainRoomWallState[Direction.West] && mainRoomWallState[Direction.North] && room.xIndex == mainRoom.xIndex - 1) ||
            (mainRoomWallState[Direction.West] && mainRoomWallState[Direction.North] && mainRoomWallState[Direction.East] && room.yIndex == mainRoom.yIndex - 1)
        ) {
            enabled = true;
        }

        //push enabled state to the room
        room.setEnabled(enabled);
        
        //turn off all walls except main room walls
        //we dont enable here as well because walls are shared between rooms and could resolve as enabled/disabled in the wrong order
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