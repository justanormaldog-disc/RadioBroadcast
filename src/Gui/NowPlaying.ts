import TerminalBox from "./TerminalBox.js";
import blessed from "blessed";
import configStyles from "./config.js";
import { Radio } from "../Radio.js";
import { Keys } from "./Gui.js";

export default class NowPlaying extends TerminalBox {
    radio: Radio;
    progressBar: blessed.Widgets.ProgressBarElement;
    nowPlayingText: blessed.Widgets.TextElement;

    constructor(config: blessed.Widgets.BoxOptions, radio: Radio) {
        super(config);

        const progressBar = blessed.progressbar(configStyles.progressBar)

        const nowPlayingText = blessed.text({
            top: 0,
            left: 0,
            align: "center",
        })

        this.progressBar = progressBar;
        this.nowPlayingText = nowPlayingText;
        this.radio = radio;

        this.box.append(nowPlayingText);
        this.box.append(progressBar);
    }

    update(readBytes: number) {
        const current = this.radio.current();
        
        if (current) {
            const totalBytes = current.bytes;
            const totalBits = totalBytes * 8;
            const bitrate = current.bitrate;

            const duration = totalBits / bitrate;
            const elapsed = readBytes / bitrate;

            const elapsedTime = {
                minutes: Math.floor(elapsed / 60),
                seconds: Math.round(elapsed % 60)
            }

            const durationTime = {
                minutes: Math.floor(duration / 60),
                seconds: Math.round(duration % 60)
            }

            this.nowPlayingText.content = `Now Playing: ${current.filename.full}`;
            this.progressBar.setProgress(readBytes / totalBytes * 100);
        } else {
            this.nowPlayingText.content = `Press ${Keys.START} to start stream`;
            this.progressBar.setProgress(0);
        }
    }
}