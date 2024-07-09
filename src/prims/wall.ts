import { KaboomCtx } from "kaplay";
import { Direction, backgroundColor, updateMainRoomWallState } from "../main";

export function createWall(k : KaboomCtx, x, y, width, height, rotation)
{
    let wall = k.add([
        k.pos(x, y),
        k.anchor("botleft"),
        k.rotate(rotation),
        k.rect(width, height),
        k.color(backgroundColor.color),
        k.area(),
        // k.outline(3, k.rgb(0, 0, 0)),
        k.body({isStatic: true}),
        {
            isMainRoomWall : false,
            reflecting : true,
            mainRoomWallDirection : Direction.North,
            setAsMainRoomWall(direction : Direction) {
                this.reflecting = false; //we init as reflecting so we can toggle it on/off
                this.isMainRoomWall = true;
                this.color = k.rgb(80,80,80);
                this.mainRoomWallDirection = direction;
            },
            setVisible(value)
            {
                this.color = value ? k.rgb(40,40,40) : backgroundColor.color;
            }
        },
        "wall",
    ]);

    wall.onClick(() => {
        if(wall.isMainRoomWall)
        {
            k.debug.log("clicked wall");
            wall.reflecting = !wall.reflecting;
            wall.color = wall.reflecting ? k.rgb(180,180,0) : k.rgb(80,80,80);
            updateMainRoomWallState(wall);
        }
    });

    // player.onDrag(() => {
    //     k.debug.log("dragging player");
    // });
    
    // player.onDragUpdate(() => {
    //     k.debug.log("drag update");
    // });

    return wall;
}