import express from "express";

import path from "path";

import { Gui } from "./Gui/Gui.js";

import { ConsoleContext } from "./Console/Console.js";

import { LoadEvent, LoadingHandler } from "./Loader/LoadingHandler.js";

import { parseConfig, ConfigInterface } from "./Loader/parseConfig.js";
import { transcodeAllSongs } from "./Loader/transcodeAllSongs.js";
import { initRadio } from "./Loader/initRadio.js";

const app = express();

const CONFIG_PATH = path.resolve("./config.json");

ConsoleContext.log("Starting server... ");

const defaultConfig: ConfigInterface = {
    PORT: 3000,
    SONGS_DIR: "/songs",
    LOOP: true,
    SHUFFLE: true,
    BUFFER_KB: 256,
    RING_BUFFER_MS: 10000,
    MAX_FFMPEG_WORKER_THREADS: 5
}

// Load necessary functions and objects
const loadingHandler = new LoadingHandler([
    new LoadEvent(
        parseConfig,
        "Parsing config.json",
        "config",
        [
            CONFIG_PATH,
            defaultConfig
        ]
    ),
    new LoadEvent(
        transcodeAllSongs,
        "Transcoding songs",
        "transcode",
        []
    ),
        new LoadEvent(
        initRadio,
        "Initalising radio",
        "radio",
        []
    ),
]);

const vars = await loadingHandler.load();

const { PORT } = vars.config;
const radio = vars.radio;

radio.start();

// init gui
const gui = new Gui(radio);
ConsoleContext.setGuiContext(gui);

setInterval(() => {
    gui.update();
    gui.updateSongProgress(radio.readBytes, radio.streamStatus());
}, 100);

app.get("/", async (req, res) => {
    res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
    });

    gui.log(`Client connected`);

    const sink = radio.createResponseSink();
    sink.pipe(res);

    res.on("close", () => {
        gui.log(`Client disconnected`);
        radio.removeResponseSink(sink.id);
    })
})

app.listen(PORT, () => {
    ConsoleContext.log(`Streaming at http://localhost:${PORT}`);
})