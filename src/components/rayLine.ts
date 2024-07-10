import { KaboomCtx, Vec2 } from "kaplay";
import { opacity } from "kaplay/dist/declaration/components";

export function rayLine(k : KaboomCtx, p1 : Vec2, p2 : Vec2, fadeTime) {
    let opacity = 0;
    return {
        draw() {
            k.drawLine({
                p1: p1,
                p2: p2,
                width: 5,
                color: k.rgb(255, 0, 0),
                opacity: opacity,
            });
        },
        update() {
            if(opacity < 1)
            {
                opacity += k.dt() / fadeTime;
            }
        }
    }
}