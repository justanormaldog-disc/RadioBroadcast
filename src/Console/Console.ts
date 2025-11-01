import { background, ColourCodes, foreground, reset } from "./ANSIColourEscapeSequence.js";
import type { Gui } from "../Gui/Gui.js";

class Console {
    private _GuiContext: Gui | null;

    constructor() {
        this._GuiContext = null;
    }

    /**
     * Logs message to  {@link Console._GuiContext GuiContext} if specified, else {@link process.stdout}.
     */
    log(message: string | number): void {
        if (this._GuiContext) {
            this._GuiContext.log(message);
        } else {
            process.stdout.write(message + "\n");
        }
    };

    /**
     * Logs message to  {@link Console._GuiContext GuiContext} if specified, else {@link process.stdout}.
     * 
     * Does not include linefeed.
     */
    raw(message: string | number): void {
        if (this._GuiContext) {
            this._GuiContext.log(message);
        } else {
            process.stdout.write(String(message));
        }
    };

    /**
     * Logs message with SGR to format into a warning.
     */
    warn(message: string | number): void {
        this.log(`${background(ColourCodes.YELLOW) + foreground(ColourCodes.BLACK) + "WARN" + reset()} ${message}`);
    };

    /**
     * Logs message with SGR to format into a error.
     * 
     * Does not stop execution. To throw a fatal error, use throw instead.
     */
    error(err: Error): void {
        this.log(`${background(ColourCodes.RED) + foreground(ColourCodes.WHITE) + "ERROR" + reset()} ${this.errorToString(err)}`);
    };

    /**
     * Sets the current {@link Gui} used to log messages to. 
     * 
     * See {@link Console.removeGuiContext removeGuiContext()} to set GuiContext to null.
     */
    setGuiContext(ctx: Gui): Gui {
        return this._GuiContext = ctx;
    };

    /**
     * Sets GuiContext to null.
     */
    removeGuiContext(): Gui | null {
        const removed = this._GuiContext;
        this._GuiContext = null;

        return removed;
    };

    private errorToString(err: Error) {
        return `${err.name}: ${err.message}`;
    }
}

export const ConsoleContext = new Console();