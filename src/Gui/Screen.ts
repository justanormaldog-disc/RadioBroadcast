import blessed from "neo-blessed";

export default class Screen {
    screen: blessed.Widgets.Screen;

    constructor() {
        this.screen = blessed.screen({
            smartCSR: true,
        })

        this.screen.title = "Not playing";

        this.screen.key(["escape", "C-c"], () => process.exit(0));
    }

    render() {
        this.screen.render();
    }
}

