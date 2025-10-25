import TerminalBox from "./TerminalBox.js";
export default class QueueBox extends TerminalBox {
    queue;
    selectedIndex;
    constructor(config, queue) {
        super(config);
        this.queue = queue;
        this.selectedIndex = 0;
    }
    update() {
        this.box.setContent("");
        if (!this.queue.head)
            return;
        // Load file names in queue box
        let current = this.queue.head;
        let str = "";
        while (current) {
            str += `${current.value.filename}\n`;
            current = current.next;
        }
        this.box.setContent(str);
    }
}
