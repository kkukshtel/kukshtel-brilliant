import { KaboomCtx } from "kaplay";
import { drag } from "../components/drag";
import { player, playerSize, roomDim, roomRowLength } from "../main";
import { rayLine } from "../components/rayLine";
import { triangle } from "../components/triangle";

export function createObject(k : KaboomCtx,x,y,rotation,owningRoom,objectID : string,isReflection = false)
{
    //make the triangle be roughly the size of the player
    let triangleHeight = playerSize * 2;
    let obj = k.add([
        k.pos(x, y),
        k.rotate(rotation),
        k.anchor("center"),
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
            },
            setHidden(value) {
                if(value)
                {
                    this.use("hidden");
                }
                else
                {
                    this.unuse("hidden");
                }
                this.children.forEach((child) => {
                    if(value)
                    {
                        child.use("hidden");
                    }
                    else
                    {
                        child.unuse("hidden");
                    }
                });
            }
        },
        "moveableObj"
    ]);

    //create the rendered triangle and child it to the parent object
    //this allows us to more easily control the rotation of the triangle and the collider
    obj.add([
        k.pos(0, -triangleHeight / 2),
        triangle(k,
            k.vec2(0, 0),
            k.vec2(triangleHeight / 2, triangleHeight),
            k.vec2(-triangleHeight / 2, triangleHeight)),
        "moveableObj"
    ]);

    //can only drag objects in the main room
    if(!obj.isReflection)
    {
        obj.use(drag(k));
        obj.use(k.body());
    }

    let rayLines = [];
    let rayPoints = [];
    let rayPreview;
    if(obj.isReflection)
    {
        //we only want to show the ray preview when we are hovering over reflected objects
        obj.onHover(() => {
            if(obj.is("hidden")){return;}
            var dir = obj.pos.sub(player.pos).unit();
            let startOffset = dir.scale(playerSize + 10);
            let origin = player.pos.add(startOffset);
            let initialDirection = dir.scale(roomDim * roomRowLength);

            //cast a ray to the distant object to see if we can actually see it
            //ignore walls and rooms
            const initialHit = k.raycast(origin, initialDirection, ["wall","room"]);
            let isValidPath = false;
            if(initialHit) //if we hit something
            {
                //and what we hit was the object we are hovering over
                if(initialHit.object.id === obj.id)
                {
                    isValidPath = true;
                }
                //draw the ray preview
                rayPreview = k.add([
                    rayLine(k,isValidPath ? k.rgb(40, 128, 40) : k.rgb(128, 40, 40),origin,initialHit.point,0.1,0)
                ]);
            }
            
            //if we had an invalid path, dont do the line tracing
            if(!isValidPath){return;}

            rayLines = [];
            rayPoints = [];
            let MAX_TRACE_DEPTH = 10;
            let traceDepth = 0;
            let hitTargetObject = false;
            let direction = dir.scale(roomDim * 2);
            //we raycast from the viewer to the object to get the path,
            //then we reverse that path to show the object to the viewer
            while (traceDepth < MAX_TRACE_DEPTH && !hitTargetObject) {
                const hit = k.raycast(origin, direction);
                if (!hit) {
                    break;
                }
                if(hit.object.objID == obj.objID)
                {
                    hitTargetObject = true;
                }
                //buffer the line points here
                rayPoints.push({"p1":k.vec2(origin),"p2":k.vec2(hit.point)});
                // Offset the point slightly, otherwise it might be too close to the surface
                // and give internal reflections
                origin = hit.point.add(hit.normal.scale(0.001));
                // Reflect vector
                direction = direction.reflect(hit.normal);
                traceDepth++;
            }

            //draw the rays
            let timerOffset = 0;
            rayPoints.reverse().forEach(p => {
                rayLines.push(k.add([
                    rayLine(k,k.rgb(255, 255, 0),p.p1,p.p2,0.2,timerOffset)
                ]));
                timerOffset += 0.2;
            });
        });

        obj.onHoverEnd(() => {
            //cleanup our hovers
            rayLines.forEach(ray => {
                ray.destroy();
            });
            if(rayPreview) {
                rayPreview.destroy();
            }
        });
    }

    //this is for objects in the main room
    if(!obj.isReflection)
    {
        //we want to basically lock them inside the room so we prevent them from moving past room boundaries
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
    
            //update reflection positions, as they move when the main object moves
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