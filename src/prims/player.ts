import { KaboomCtx } from "kaplay";
import { drag } from "../components/drag";

export function createPlayer(k : KaboomCtx,x,y,owningRoom)
{
    let playerSize = 20;
    let player = k.add([
        k.rotate(0),
        k.pos(x, y),
        drag(k),
        // k.drawTriangle({p1 : k.vec2(0, -20), p2 : k.vec2(10, 10), p3 : k.vec2(-10, 10)}),
        k.circle(playerSize),
        k.color(153,50,204),
        k.area(),
        k.anchor("center"),
        k.body(),
        k.outline(3, k.rgb(255, 0, 255)),
        {
            hovered : false,
            owningRoom : owningRoom,
            draggable : !owningRoom.isReflectedRoom
        }
    ]);

    player.onUpdate(() => {
        //left wall
        if(player.pos.x - playerSize  < owningRoom.left())
        {
            player.pos.x = owningRoom.left() + playerSize;
        }
    
        //right wall
        if(player.pos.x + playerSize  > owningRoom.right())
        {
            player.pos.x = owningRoom.right() - playerSize;
        }
    
        //bottom wall
        if(player.pos.y + playerSize  > owningRoom.bottom())
        {
            player.pos.y = owningRoom.bottom() - playerSize;
        }
    
        //top wall
        if(player.pos.y - playerSize  < owningRoom.top())
        {
            player.pos.y = owningRoom.top() + playerSize;
        }
    });

    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return player;
}