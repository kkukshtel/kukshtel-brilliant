import { KaboomCtx } from "kaplay";
import { drag } from "../components/drag";

export function createObject(k : KaboomCtx,x,y,rotation,owningRoom)
{
    let triangleHeight = 40;
    let obj = k.add([
        k.rotate(rotation),
        k.pos(x, y),
        drag(k),
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