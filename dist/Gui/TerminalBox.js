import blessed from "blessed";
export default class TerminalBox {
    box;
    constructor(config) {
        this.box = blessed.box(config);
    }
}
