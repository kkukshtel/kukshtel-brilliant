import { Direction, backgroundColor, currentObjectID, getNextObjectID, mainRoom, roomDim, roomRowLength, rooms } from "../main";
import { KaboomCtx } from "kaplay";
import { createObject } from "./object";
import { createPlayer } from "./player";

export function createRoom(k : KaboomCtx,x, y, xindex, yindex)
{
    let newRoom = k.add([
        k.rotate(0),
        k.pos(x, y),
        k.rect(roomDim, roomDim),
        k.color(backgroundColor.color),
        k.area(),
        k.anchor("center"),
        "room",
        k.outline(3, k.rgb(0, 0, 0)),
        {
            hovered : false,
            xIndex : xindex,
            yIndex : yindex,
            isReflectedRoom : false,
            enabled : true,
            isMainRoom : false,
            ownedObjects : [],
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
            northRoom(){return getRoomInDirectionFromRoom(this, Direction.North)},
            southRoom(){return getRoomInDirectionFromRoom(this, Direction.South)},
            eastRoom(){return getRoomInDirectionFromRoom(this, Direction.East)},
            westRoom(){return getRoomInDirectionFromRoom(this, Direction.West)},
            addPlayer() {
                if(this === mainRoom)
                {
                    let player = createPlayer(k,x,y,this);
                    this.ownedObjects.push(player);
                    rooms.forEach(room => {
                        if(room === mainRoom) return;
                        let additionalPlayer = createPlayer(k,room.x,room.y,room,true);
                        room.ownedObjects.push(additionalPlayer);
                        player.addReflection(additionalPlayer, room);
                    });
                    return player;
                }
            },
            addObject() {
                if(this === mainRoom)
                {
                    let id = getNextObjectID() + "";
                    let obj = createObject(k,x,y,90,this,id);
                    this.ownedObjects.push(obj);
                    rooms.forEach(room => {
                        if(room === mainRoom) return;
                        let reflectedObject = createObject(k,room.x,room.y,90,room,id,true);
                        room.ownedObjects.push(reflectedObject);
                        obj.addReflection(reflectedObject, room);
                    });
                    return obj;
                }
            },
            getWalls() {
                let walls = [];
                let origin = this.pos;
                const MAX_DISTANCE = roomDim + roomDim / 2;
                let raycastDirections = [
                    k.vec2(0,-1),
                    k.vec2(0,1),
                    k.vec2(1,0),
                    k.vec2(-1,0),
                ];
                raycastDirections.forEach(direction => {
                    let dir = direction.scale(MAX_DISTANCE)
                    let hitWall = false;
                    while (!hitWall) {
                        const hit = k.raycast(origin, dir, ["moveableObj","room"]);
                        if (!hit) {
                            break;
                        }
                        if(hit.object.is("wall"))
                        {
                            walls.push(hit.object);
                        }
                        hitWall = true;
                    }
                });
                return walls;
            },
            setEnabled(value)
            {
                this.enabled = value;
                this.outline.color = value ? k.rgb(0, 0, 0) : k.rgb(20, 20, 20);
                this.color = backgroundColor.color;
                this.ownedObjects.forEach(obj => {
                    obj.setHidden(!value);
                });
            }
        }
    ]);

    newRoom.onHover(() => {
        if(!newRoom.enabled) return;
        newRoom.hovered = true;
        newRoom.color = k.rgb(25,25,25);
    });
    
    newRoom.onHoverEnd(() => {
        if(!newRoom.enabled) return;
        newRoom.hovered = false;
        newRoom.color = backgroundColor.color;
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