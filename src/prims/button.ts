export function addButton(k,txt, p, f) {
    // add a parent background object
    const btn = k.add([
        k.rect(240, 80, { radius: 8 }),
        k.pos(p),
        k.area(),
        k.scale(1),
        k.anchor("center"),
        k.outline(4),
    ]);

    // add a child object that displays the text
    btn.add([
        k.text(txt),
        k.anchor("center"),
        k.color(0, 0, 0),
    ]);

    // onClick() comes from area() component
    // it runs once when the object is clicked
    btn.onClick(f);

    return btn;
}