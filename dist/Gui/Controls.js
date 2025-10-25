import { Keys } from "./Gui.js";
import TerminalBox from "./TerminalBox.js";
export class Controls extends TerminalBox {
    constructor(config) {
        super(config);
        this.setQueueTips();
    }
    setQueueTips() {
        this.box.content = `
        ${Keys.SHUFFLE} - Shuffle queue
        `;
    }
}
export class ControlsHandler {
    gui;
    screen;
    radio;
    constructor(gui) {
        this.gui = gui;
        this.screen = gui.screen;
        this.radio = gui.radio;
        this.init();
    }
    init() {
        const screen = this.screen.screen;
        screen.key("x", () => {
            this.radio.shuffle();
            this.gui.queue.update();
            this.gui.screen.render();
            this.gui.log("Shuffled queue");
        });
        screen.key("y", () => {
            this.gui.log("Updated GUI");
            this.gui.update();
        });
    }
}
