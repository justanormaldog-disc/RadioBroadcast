import blessed from "blessed";
import { Radio } from "../Radio.js";
import { Controls, ControlsHandler } from "./Controls.js";
import QueueBox from "./Queue.js";
import Screen from "./Screen.js";
import Log from "./Log.js";

export enum Keys {
    SHUFFLE = "x",
}

export class Gui {
    radio: Radio;
    controls: Controls;
    queue: QueueBox;
    screen: Screen;
    logBox: Log;

    constructor(radio: Radio) {
        this.radio = radio;

        this.screen = new Screen();
        this.controls = new Controls(
            {
                label: 'Controls',
                border: { type: 'line' },
                top: '85%',
                left: '50%',
                width: '50%',
                height: 5,
                style: {
                    fg: 'white',
                    bg: 'transparent',
                    border: {
                        fg: '#f0f0f0',
                        bg: "#181818"
                    }
                }
            }
        );
        
        this.queue = new QueueBox(
            {
                border: { type: 'line' },
                top: 0,
                left: '50%',
                width: '50%',
                height: '70%',
                scrollable: true,
                label: 'Queue',
                style: {
                    fg: 'white',
                    bg: 'transparent',
                    border: {
                        fg: '#f0f0f0',
                        bg: "#181818",
                    }
                }
            }, 
            radio.queue
        );

        this.logBox = new Log(
             {
                label: 'Log',
                border: { type: 'line' },
                left: 0,
                width: '50%',
                height: "100%",
                style: {
                    fg: 'white',
                    bg: 'transparent',
                    border: {
                        fg: '#f0f0f0',
                        bg: "#181818"
                    }
                }
            }
        )

        new ControlsHandler(this);

        this.screen.screen.append(this.controls.box);
        this.screen.screen.append(this.queue.box);
        this.screen.screen.append(this.logBox.box);

        this.screen.render();
    }

    update() {
        this.queue.update();

        let title = this.radio.current()?.filename;
        title ??= "";
        this.setTitle(title);
        
        this.screen.render();
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