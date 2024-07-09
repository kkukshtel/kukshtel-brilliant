import { DrawLinesOpt, KaboomCtx } from "kaplay";
import { drag } from "../components/drag";
import { player, roomDim } from "../main";

let rayPreview : DrawLinesOpt = null;
export function createObject(k : KaboomCtx,x,y,rotation,owningRoom,isReflection = false)
{
    let triangleHeight = 40;

    let obj = k.add([
        k.pos(x, y),
        k.rotate(rotation),
        k.anchor("center"),
        k.area({shape: new k.Rect(k.vec2(0,0), triangleHeight, triangleHeight)}),
        {
            hovered : false,
            owningRoom : owningRoom,
            draggable : !owningRoom.isReflectedRoom,
            isReflection : isReflection,
            reflections : [],
            addReflection(reflectedObject, room) {
                this.reflections.push({reflectedObject, room});
            }
        },
        "moveableObj",
    ]);

    obj.add([
        k.pos(0, -triangleHeight / 2),
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
        k.outline(3, k.rgb(255, 0, 0)),
        "moveableObj"
    ]);

    if(!obj.isReflection)
    {
        obj.use(drag(k));
        obj.use(k.body());
    }

    
    if(obj.isReflection)
    {
        obj.onHover(() => {
            k.debug.log(obj.pos + " " + player.pos);
            rayPreview = 
            {
                pts: [
                    obj.pos,
                    player.pos,
                ],
                join: "round",
                cap: "round",
                width: 20,
            }
        });

        obj.onHoverEnd(() => {
            rayPreview = null;
        });
    }

    k.onDraw(() => {
        if(rayPreview)
        {
            k.drawLines(rayPreview);
        }
    });
    

    if(!obj.isReflection)
    {
        obj.onUpdate(() => {
            //left wall
            if(obj.pos.x - (triangleHeight/2)  < obj.owningRoom.left())
            {
                obj.pos.x = obj.owningRoom.left() + (triangleHeight/2);
            }
        
            //right wall
            if(obj.pos.x + (triangleHeight/2)  > obj.owningRoom.right())
            {
                obj.pos.x = obj.owningRoom.right() - (triangleHeight/2);
            }
        
            //bottom wall
            if(obj.pos.y + (triangleHeight/2)  > obj.owningRoom.bottom())
            {
                obj.pos.y = obj.owningRoom.bottom() - (triangleHeight/2);
            }
        
            //top wall
            if(obj.pos.y - (triangleHeight/2)  < obj.owningRoom.top())
            {
                obj.pos.y = obj.owningRoom.top() + (triangleHeight/2);
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

    return obj;
}