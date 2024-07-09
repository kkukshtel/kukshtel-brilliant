import { Direction, mainRoom, roomDim, roomRowLength, rooms } from "../main";
import { createObject } from "./object";
import { createPlayer } from "./player";

export function createRoom(k,x, y, xindex, yindex)
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
            addPlayer() {
                if(this === mainRoom)
                {
                    let player = createPlayer(k,x,y,this);
                    rooms.forEach(room => {
                        if(room === mainRoom) return;
                        let additionalPlayer = createPlayer(k,room.x,room.y,room,true);
                        player.addReflection(additionalPlayer, room);
                    });
                }
            },
            addObject() {
                if(this === mainRoom)
                {
                    let obj = createObject(k,x,y,90,this);
                    rooms.forEach(room => {
                        if(room === mainRoom) return;
                        let reflectedObject = createObject(k,room.x,room.y,90,room,true);
                        obj.addReflection(reflectedObject, room);
                    });
                }
            }
        }
    ]);

    newRoom.onHover(() => {
        newRoom.hovered = true;
        newRoom.color = k.rgb(40,40,40);
    });
    
    newRoom.onHoverEnd(() => {
        newRoom.hovered = false;
        newRoom.color = k.rgb(20,20,20);
    });

    return newRoom;
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