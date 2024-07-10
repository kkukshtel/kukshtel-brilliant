import { DrawLineOpt, KaboomCtx } from "kaplay";
import { drag } from "../components/drag";
import { player, playerSize, roomDim } from "../main";
import { rayLine } from "../components/rayLine";

let rayPreview : DrawLineOpt = null;
export function createObject(k : KaboomCtx,x,y,rotation,owningRoom,objectID : string,isReflection = false)
{
    let triangleHeight = playerSize * 2;

    let obj = k.add([
        k.pos(x, y),
        k.rotate(rotation),
        k.anchor("center"),
        // k.body(),
        k.area({shape: new k.Rect(k.vec2(0,0), triangleHeight, triangleHeight)}),
        {
            objID : objectID,
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
        "moveableObj",
    ]);

    if(!obj.isReflection)
    {
        obj.use(drag(k));
        obj.use(k.body());
    }

    let rayLines = [];
    if(obj.isReflection)
    {
        obj.onHover(() => {
            var dir = obj.pos.sub(player.pos).unit();
            let startOffset = dir.scale(playerSize + 10);
            rayPreview = 
            {
                p1 : obj.pos,
                p2 : player.pos.add(startOffset),
                // cap: "round",
                width: 5,
                color : k.rgb(40, 40, 40),
            }

            let MAX_TRACE_DEPTH = 10;
            let traceDepth = 0;
            let hitTargetObject = false;
            let origin = player.pos.add(startOffset);
            let direction = dir.scale(roomDim * 2);
            let timerOffset = 0;
            k.debug.log("raycast for object " + obj.objID);
            while (traceDepth < MAX_TRACE_DEPTH && !hitTargetObject) {
                const hit = k.raycast(origin, direction);
                if (!hit) {
                    // k.drawLine({
                    //     p1: origin.sub(this.pos),
                    //     p2: origin.add(direction).sub(this.pos),
                    //     width: 1,
                    //     color: this.color,
                    // });
                    break;
                }
                k.debug.log("hit object " + hit.object.objID);
                if(hit.object.objID == obj.objID)
                {
                    hitTargetObject = true;
                }
                // // Draw hit point
                // k.drawCircle({
                //     pos: pos,
                //     radius: 4,
                //     color: this.color,
                // });
                // // Draw hit normal
                // k.drawLine({
                //     p1: pos,
                //     p2: pos.add(hit.normal.scale(20)),
                //     width: 1,
                //     color: k.BLUE,
                // });
                rayLines.push(k.add([
                    rayLine(k,origin,hit.point,1 + timerOffset)
                ]));
                timerOffset += 0.1;
                // Draw hit distance
                // k.drawLine({
                //     p1: origin.sub(this.pos),
                //     p2: pos,
                //     width: 1,
                //     color: this.color,
                // });
                // Offset the point slightly, otherwise it might be too close to the surface
                // and give internal reflections
                origin = hit.point.add(hit.normal.scale(0.001));
                // Reflect vector
                direction = direction.reflect(hit.normal);
                traceDepth++;
            }

        });

        obj.onHoverEnd(() => {
            rayLines.forEach(ray => {
                ray.destroy();
            });
            rayPreview = null;
        });
    }

    k.onDraw(() => {
        if(rayPreview)
        {
            k.drawLine(rayPreview);
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