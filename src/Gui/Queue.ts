import blessed from "neo-blessed";
import TerminalBox from "./TerminalBox.js";
import { Queue, QueueElement } from "../Queue.js";
import Song from "../Song.js";

export default class QueueBox extends TerminalBox {
    queue: Queue<Song>;
    selectedIndex: number;

    constructor(config: blessed.Widgets.BoxOptions, queue: Queue<Song>) {
        super(config);
        this.queue = queue;
        this.selectedIndex = 0;
    }

    update(): void {
        this.box.setContent("");
        
        if (!this.queue.head) return;

        // Load file names in queue box
        let current: QueueElement<Song> | null = this.queue.head;
        let str = "";

        while (current) {
            str += `${current.value.filename.full}\n`;
            current = current.next;
        }

        this.box.setContent(str);
    }
}
