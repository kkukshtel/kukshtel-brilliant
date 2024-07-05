import startGame, { Anchor } from "kaplay"
const k = startGame()
k.setBackground(51,54,82);

//height() / width() are the height and width of the screen
//f1 for outline debug mode

//look at 
/*
    linejoin
    drag
    raycastObject
*/
//linejoindrag

const roomDim = 200;

//function that creates and returns a room
function createRoom(x, y)
{
    let newRoom = k.add([
        k.rotate(0),
        k.pos(x, y),
        k.rect(roomDim, roomDim),
        k.color(),
        k.area(),
        k.anchor("center"),
        k.outline(3, k.rgb(0, 0, 0)),
    ]);

    // anchor becomes 0,0 for children

    let off =  roomDim / 2;
    //top
    newRoom.add(createWall(-off,-off, roomDim, 15));
    //right
    newRoom.add(createWall(off,-off, 15, roomDim,"topleft"));
    //bottom
    newRoom.add(createWall(-off,off, roomDim, 15, "topleft"));
    //left
    newRoom.add(createWall(-off,-off, 15, roomDim, "topright"));
    return newRoom;
}

function createWall(x, y, width, height,anchor : Anchor = "botleft",rotation = 0) {
    return [
        k.pos(x, y),
        k.anchor(anchor),
        k.rotate(rotation),
        k.rect(width, height),
        k.color(),
        k.area(),
        k.outline(3, k.rgb(0, 0, 0)),
        k.body({isStatic: true}),
        {
            toggleSelected() {
                if(this.is("notSelected")) {
                    this.color = k.rgb(255, 0, 0)
                    this.unuse("notSelected");
                    this.use("selected");
                } else {
                    this.color = k.rgb(0, 255, 0)
                    this.unuse("selected");
                    this.use("notSelected");
                }
            }
        },
        "wall",
        "notSelected",
    ];
}

const startingRoom = createRoom(k.width() /2, k.height() / 2);


k.onClick("wall", (wall) => {
    k.debug.log("clicked wall");
    wall.toggleSelected();
});

const scoreLabel = k.add([k.text("100"), k.pos(24, 24)]);

// k.loop(1, () => {
// });

// room.onUpdate(() => {
//     room.angle += 120 * k.dt();
// });

// wall.onMousePress(() => {
// });

// onUpdate(() => {
//     score++;
//     scoreLabel.text = score;
// });



k.loadSprite("bean", "sprites/bean.png")

// k.add([
//     k.pos(500, 100),
//     k.sprite("bean"),
// ])

// k.onClick(() => k.addKaboom(k.mousePos()))