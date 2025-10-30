import blessed from "neo-blessed";

export default class TerminalBox {
    box: blessed.Widgets.BoxElement;

    constructor(config: blessed.Widgets.BoxOptions) {
        this.box = blessed.box(config);
    }
}
