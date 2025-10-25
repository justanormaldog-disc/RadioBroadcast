import blessed from "blessed";

export default class Log {
    box: blessed.Widgets.Log;
    constructor(config: blessed.Widgets.BoxOptions) {
        this.box = blessed.log(config);
    }

    /**
     * Logs to the console in the terminal GUI.
     */
    log(message: string | number) {
        if (typeof message === "number") {
            message = message.toString();
        }

        this.box.log(`${message} [${(new Date()).toTimeString().split(' ')[0]}]`);
    }

    /**
     * Alias for {@link Log.log this.log}
     */
    info(message: string | number) {
        this.log(message);
    }
}