import { KaboomCtx } from "kaplay";
import { drag } from "../components/drag";
import { roomDim } from "../main";

export function createObject(k : KaboomCtx,x,y,rotation,owningRoom,isReflection = false)
{
    let triangleHeight = 40;
    let obj = k.add([
        k.rotate(rotation),
        k.pos(x, y),
        "moveableObj",
        // drag(k),
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
        // k.area({ shape: new k.Rect(k.vec2(0,triangleHeight/2), triangleHeight, triangleHeight)}),
        // k.anchor("center"),
        // k.body(),
        k.outline(3, k.rgb(255, 0, 0)),
        {
            hovered : false,
            owningRoom : owningRoom,
            draggable : !owningRoom.isReflectedRoom,
            isReflection : isReflection,
            reflections : [],
            addReflection(reflectedObject, room) {
                this.reflections.push({reflectedObject, room});
            }
        }
    ]);

    if(!isReflection)
    {
        obj.use(k.area({ shape: new k.Rect(k.vec2(0,triangleHeight/2), triangleHeight, triangleHeight)}));
        obj.use(drag(k));
        obj.use(k.anchor("center"));
        obj.use(k.body());
    }
    

    if(!obj.isReflection)
    {
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
            if (centerX - halfHeight < obj.owningRoom.left()) 
            {
                obj.pos.x += obj.owningRoom.left() - (centerX - halfHeight);
            }
            if (centerX + halfHeight > obj.owningRoom.right())
            {
                obj.pos.x -= (centerX + halfHeight) - obj.owningRoom.right();
            }
            if (centerY - halfHeight < obj.owningRoom.top())
            {
                obj.pos.y += obj.owningRoom.top() - (centerY - halfHeight);
            }
            if (centerY + halfHeight > obj.owningRoom.bottom())
            {
                obj.pos.y -= (centerY + halfHeight) - obj.owningRoom.bottom();
            }
    
            //update reflections
            obj.reflections.forEach(reflection => {
                let roomDiff = k.vec2(reflection.room.xIndex, reflection.room.yIndex).sub(k.vec2(owningRoom.xIndex, owningRoom.yIndex));
                let rX, rY;
                if(roomDiff.x % 2 === 0)
                {
                    rX = obj.pos.x + roomDiff.x * roomDim;
                }
                else
                {
                    let off = obj.pos.x - owningRoom.pos.x;
                    rX = reflection.room.pos.x - off;
                    reflection.reflectedObject.angle = obj.angle + 180;
                }
                if(roomDiff.y % 2 === 0)
                {
                    rY = obj.pos.y + roomDiff.y * roomDim;
                }
                else
                {
                    let off = obj.pos.y - owningRoom.pos.y;
                    rY = reflection.room.pos.y - off;
                }
                reflection.reflectedObject.pos.x = rX;
                reflection.reflectedObject.pos.y = rY;
            });
        
        });
    }


    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return obj;
}