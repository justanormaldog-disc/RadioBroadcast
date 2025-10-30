import blessed from "neo-blessed";
import {  Gui, Keys } from "./Gui.js";
import TerminalBox from "./TerminalBox.js";
import Screen from "./Screen.js";
import { Radio, StreamStatus } from "../Radio.js";

export class Controls extends TerminalBox {
    constructor(config: blessed.Widgets.BoxOptions) {
        super(config);
        this.setQueueTips();
    }

    setQueueTips() {
        this.box.content = `
        ${Keys.SHUFFLE} - Shuffle queue\n
        ${Keys.START} - Start stream | ${Keys.STOP} - End stream
        `
    }
}

export class ControlsHandler {
    gui: Gui;
    screen: Screen;
    radio: Radio;

    constructor(gui: Gui) {
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
        })

        screen.key("p", () => {
            if (this.radio.streamStatus() === StreamStatus.INACTIVE) this.radio.start();
        })

        screen.key("s", () => {
            if (this.radio.streamStatus() === StreamStatus.ACTIVE) this.radio.stop();
        })
    }
}