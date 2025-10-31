import { background, ColourCodes, foreground, reset } from "./ANSIColourEscapeSequence.js";
import type { Gui } from "./Gui/Gui.js";

class Console {
    private _GuiContext: Gui | null;

    constructor() {
        this._GuiContext = null;
    }

    log(message: string | number): void {
        if (this._GuiContext) {
            this._GuiContext.log(message);
        } else {
            process.stdout.write(message + "\n");
        }
    };

    warn(message: string | number): void {
        this.log(
            `
            ${background(ColourCodes.YELLOW) + foreground(ColourCodes.WHITE) + "WARN" + reset()} ${message}
            `
            );
    };

    error(message: string | number): void {
        this.log(`${background(ColourCodes.RED) + foreground(ColourCodes.WHITE) + "ERROR" + reset()} ${message}`);
    };

    setGuiContext(ctx: Gui): Gui {
        return this._GuiContext = ctx;
    };
    removeGuiContext(): Gui | null {
        const removed = this._GuiContext;
        this._GuiContext = null;

        return removed;
    };
}