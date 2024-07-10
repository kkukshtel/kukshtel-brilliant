import { Color, KaboomCtx, Vec2 } from "kaplay";

export function rayLine(k : KaboomCtx, color : Color, p1 : Vec2, p2 : Vec2, fadeTime, delay) {
    let opacity = 0;
    let delayAcc = 0;
    return {
        draw() {
            if(delayAcc < delay)
            {
                delayAcc += k.dt();
                return;
            }
            k.drawLine({
                p1: p1,
                p2: p2,
                width: 5,
                color: color,
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