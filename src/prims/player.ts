import { KaboomCtx } from "kaplay";
import { drag } from "../components/drag";
import { backgroundColor, playerSize, roomDim } from "../main";

export function createPlayer(k : KaboomCtx,x,y,owningRoom,isReflection = false)
{
    let player = k.add([
        k.rotate(0),
        k.pos(x, y),
        k.area(),
        k.anchor("center"),
        "moveableObj",
        k.circle(playerSize),
        k.color(153,50,204),
        k.outline(3, k.rgb(255, 0, 255)),
        {
            hovered : false,
            owningRoom : owningRoom,
            draggable : !owningRoom.isReflectedRoom,
            isReflection : isReflection,
            reflections : [],
            addReflection(reflectedPlayer, room) {
                this.reflections.push({reflectedPlayer, room});
            },
            setHidden(value) {
                if(value)
                {
                    this.color = backgroundColor.color;
                    this.outline.color = backgroundColor.color;
                    this.use("hidden");
                }
                else
                {
                    this.color = k.rgb(153,50,204);
                    this.outline.color = k.rgb(255, 0, 255);
                    this.unuse("hidden");
                }
            }
        }
    ]);

    if(!isReflection)
    {
        player.use(drag(k));
        player.use(k.body());
    }

    if(!player.isReflection)
    {
        //lock the player to the room
        player.onUpdate(() => {
            //left wall
            if(player.pos.x - playerSize  < player.owningRoom.left())
            {
                player.pos.x = player.owningRoom.left() + playerSize;
            }
        
            //right wall
            if(player.pos.x + playerSize  > player.owningRoom.right())
            {
                player.pos.x = player.owningRoom.right() - playerSize;
            }
        
            //bottom wall
            if(player.pos.y + playerSize  > player.owningRoom.bottom())
            {
                player.pos.y = player.owningRoom.bottom() - playerSize;
            }
        
            //top wall
            if(player.pos.y - playerSize  < player.owningRoom.top())
            {
                player.pos.y = player.owningRoom.top() + playerSize;
            }

            //update reflections
            player.reflections.forEach(reflection => {
                let roomDiff = k.vec2(reflection.room.xIndex, reflection.room.yIndex).sub(k.vec2(owningRoom.xIndex, owningRoom.yIndex));
                let rX, rY;
                if(roomDiff.x % 2 === 0)
                {
                    rX = player.pos.x + roomDiff.x * roomDim;
                }
                else
                {
                    let off = player.pos.x - owningRoom.pos.x;
                    rX = reflection.room.pos.x - off;
                }
                if(roomDiff.y % 2 === 0)
                {
                    rY = player.pos.y + roomDiff.y * roomDim;
                }
                else
                {
                    let off = player.pos.y - owningRoom.pos.y;
                    rY = reflection.room.pos.y - off;
                }
                reflection.reflectedPlayer.pos.x = rX;
                reflection.reflectedPlayer.pos.y = rY;
            });
        });
    }

    return player;
}