import { KaboomCtx, Vec2 } from "kaplay";

//create a triangle component
export function triangle(k : KaboomCtx, p1 : Vec2, p2 : Vec2, p3 : Vec2) {
    return {
        draw() {
            if(!this.is("hidden"))
            {
                k.drawTriangle({
                    p1: p1,
                    p2: p2,
                    p3: p3,
                    fill: true,
                    color : k.rgb(128, 0, 0),
                    outline: { color: k.RED, width: 3},
                });
            }
        },
    }
}