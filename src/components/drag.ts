import { KaboomCtx } from "kaplay";


export let curDraggin = null; //keep track of the current dragged object

//create a drag component
//mostly from https://play.kaplayjs.com/?example=drag
export function drag(k: KaboomCtx) {
    // The displacement between object pos and mouse pos
    let offset = k.vec2(0);

    return {
        // Name of the component
        id: "drag",
        // This component requires the "pos" and "area" component to work
        require: ["pos", "area"],
        pick() {
            // Set the current global dragged object to this
            curDraggin = this;
            offset = k.mousePos().sub(this.pos);
            this.trigger("drag");
        },
        // "update" is a lifecycle method gets called every frame the obj is in scene
        update() {
            if (curDraggin === this) {
                this.pos = k.mousePos().sub(offset);
                this.trigger("dragUpdate");
            }
        },
        onDrag(action) {
            return this.on("drag", action);
        },
        onDragUpdate(action) {
            return this.on("dragUpdate", action);
        },
        onDragEnd(action) {
            return this.on("dragEnd", action);
        },
    };
}

export function clearDrag() {
    curDraggin = null;
}