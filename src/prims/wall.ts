import { KaboomCtx } from "kaplay";
import { Direction } from "../main";

export function createWall(k : KaboomCtx, x, y, width, height, direction : Direction)
{
    let wall = k.add([
        k.pos(x, y),
        k.anchor("botleft"),
        k.rotate(direction == Direction.East ? 90 : 
                 direction == Direction.South ? 180 :
                 direction == Direction.West ? 270 : 0),
        k.rect(width, height),
        k.color(60,60,60),
        k.area(),
        // k.outline(3, k.rgb(0, 0, 0)),
        k.body({isStatic: true}),
        {
            toggleReflection() {
                this.reflecting = !this.reflecting;
                this.color = this.reflecting ? k.rgb(180,180,0) : k.rgb(60,60,60); 
            }
        },
        {
            reflecting : false,
        },
        "wall",
    ]);

    wall.onClick(() => {
        k.debug.log("clicked wall");
        wall.toggleReflection();
    });

    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return wall;
}