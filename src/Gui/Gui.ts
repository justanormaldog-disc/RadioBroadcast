import blessed from "blessed";
import { Radio } from "../Radio.js";
import { Controls, ControlsHandler } from "./Controls.js";
import QueueBox from "./Queue.js";
import Screen from "./Screen.js";
import Log from "./Log.js";
import config from "./config.js";
import NowPlaying from "./NowPlaying.js";

export enum Keys {
    SHUFFLE = "x",
    START = "p",
    STOP = "s",
}

export class Gui {
    radio: Radio;
    controls: Controls;
    queue: QueueBox;
    screen: Screen;
    logBox: Log;
    nowPlaying: NowPlaying;

    constructor(radio: Radio) {
        this.radio = radio;

        this.screen = new Screen();
        this.controls = new Controls(config.controls as blessed.Widgets.BoxOptions);
        
        this.queue = new QueueBox(
            config.queueBox as blessed.Widgets.BoxOptions, 
            radio.queue
        );

        this.logBox = new Log(config.log as blessed.Widgets.BoxOptions);

        this.nowPlaying = new NowPlaying(
            config.nowPlaying as blessed.Widgets.BoxOptions,
            radio
        )

        new ControlsHandler(this);

        this.screen.screen.append(this.controls.box);
        this.screen.screen.append(this.queue.box);
        this.screen.screen.append(this.logBox.box);
        this.screen.screen.append(this.nowPlaying.box);

        this.screen.render();
    }

    update() {
        this.queue.update();

        let title = this.radio.current()?.filename.noExtension;
        title ??= "";
        this.setTitle(title);
        
        this.screen.render();
    }

    updateSongProgress(readBytes: number) {

    }

    /**
     * Logs to the console in the terminal GUI.
     */
    log(message: string | number) {
        this.logBox.log(message);
    }

    setTitle(newTitle: string) {
        this.screen.screen.title = newTitle;
    }
}