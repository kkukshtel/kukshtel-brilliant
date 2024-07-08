//import k from main.ts
import { k } from "./main";

// Keep track of the current draggin item
let curDraggin = null;

// A custom component for handling drag & drop behavior
export function drag() {
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


// Check if someone is picked
k.onMousePress(() => {
    if (curDraggin) {
        return;
    }
    // Loop all "bean"s in reverse, so we pick the topmost one
    for (const obj of k.get("drag").reverse()) {
        // If mouse is pressed and mouse position is inside, we pick
        if (obj.isHovering()) {
            obj.pick();
            break;
        }
    }
});

// Drop whatever is dragged on mouse release
k.onMouseRelease(() => {
    if (curDraggin) {
        curDraggin.trigger("dragEnd");
        curDraggin = null;
    }
});

