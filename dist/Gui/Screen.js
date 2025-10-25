import blessed from "blessed";
export default class Screen {
    screen;
    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
        });
        this.screen.title = "Not playing";
        this.screen.key(["escape", "C-c"], () => process.exit(0));
    }
    render() {
        this.screen.render();
    }
}
