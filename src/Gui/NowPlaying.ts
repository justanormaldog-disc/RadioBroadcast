import TerminalBox from "./TerminalBox.js";
import blessed from "neo-blessed";
import configStyles from "./config.js";
import { Radio } from "../Radio.js";
import { Keys } from "./Gui.js";

export default class NowPlaying extends TerminalBox {
    radio: Radio;
    progressBar: blessed.Widgets.ProgressBarElement;
    nowPlayingText: blessed.Widgets.TextElement;
    elapsed: blessed.Widgets.TextElement;
    duration: blessed.Widgets.BoxElement;

    constructor(config: blessed.Widgets.BoxOptions, radio: Radio) {
        super(config);

        const progressBar = blessed.progressbar(configStyles.progressBar);

        const nowPlayingText = blessed.text({
            top: 0,
            left: 0,
        })

        const elapsed = blessed.text({
            top: `50%-1`,
            left: "5%",
            align: "left",
        })

        const duration = blessed.box({
            top: `50%-1`,
            left: configStyles.progressBar.left,
            width: configStyles.progressBar.width,
            align: "right",
        })

        this.progressBar = progressBar;
        this.nowPlayingText = nowPlayingText;
        this.duration = duration;
        this.elapsed = elapsed;
        this.radio = radio;

        this.box.append(nowPlayingText);
        this.box.append(duration);
        this.box.append(elapsed);
        this.box.append(progressBar);
    }

    update(readBytes: number) {
        const current = this.radio.current();
        
        if (current) {
            const totalBytes = current.bytes;
            const totalBits = totalBytes * 8;
            const readBits = readBytes * 8;
            const bitrate = current.bitrate;

            const duration = totalBits / bitrate;
            const elapsed = readBits / bitrate;

            const elapsedTime = {
                minutes: Math.floor(elapsed / 60),
                seconds: Math.floor(elapsed % 60).toString().padStart(2, "0")
            }

            const durationTime = {
                minutes: Math.floor(duration / 60),
                seconds: Math.floor(duration % 60).toString().padStart(2, "0")
            }

            this.nowPlayingText.setContent(`Now Playing: ${current.filename.full}`);
            this.elapsed.setContent(`${elapsedTime.minutes}:${elapsedTime.seconds}`)
            this.duration.setContent(`${durationTime.minutes}:${durationTime.seconds}`);
            this.progressBar.setProgress(readBytes / totalBytes * 100);
            
        } else {
            this.nowPlayingText.content = `Press ${Keys.START} to start stream`;
            this.progressBar.setProgress(0);
        }
    }
}