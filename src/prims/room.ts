import { roomDim } from "../main";

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