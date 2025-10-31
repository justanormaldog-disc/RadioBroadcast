import express from "express";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";

import path from "path";
import { Radio } from "./Radio.js";
import Song from "./Song.js";
import { Gui } from "./Gui/Gui.js";
import { transcodeSongs } from "./transcode.js";
import { ConsoleContext } from "./Console.js";
const app = express();

ConsoleContext.log("Starting server... ");

interface ConfigInterface {
    PORT: number,
    SONGS_DIR: string,
    LOOP: boolean,
    SHUFFLE: boolean,
    BUFFER_KB: number,
    RING_BUFFER_MS: number,
    MAX_FFMPEG_WORKER_THREADS: number,
}

interface ParsedConfigInterface {
    PORT: number | undefined,
    SONGS_DIR: string | undefined,
    LOOP: boolean | undefined,
    SHUFFLE: boolean | undefined,
    BUFFER_KB: number | undefined,
    RING_BUFFER_MS: number | undefined,
    MAX_FFMPEG_WORKER_THREADS: number | undefined,
}

let defaultConfig: ConfigInterface = {
    PORT: 3000,
    SONGS_DIR: "/songs",
    LOOP: true,
    SHUFFLE: true,
    BUFFER_KB: 256,
    RING_BUFFER_MS: 10000,
    MAX_FFMPEG_WORKER_THREADS: 5
}

type PropertyKey = "PORT" | "SONGS_DIR" | "LOOP" | "SHUFFLE" | "BUFFER_KB" | "RING_BUFFER_MS" | "MAX_FFMPEG_WORKER_THREADS";

const requiredProperties: PropertyKey[] = [
    "PORT",
    "SONGS_DIR",
    "LOOP",
    "SHUFFLE",
    "BUFFER_KB",
    "RING_BUFFER_MS",
    "MAX_FFMPEG_WORKER_THREADS",
]

// Fetch configuration file

let config: ConfigInterface = defaultConfig;

ConsoleContext.log("Parsing config.json... (1/3)");

try {
    const parsed: ParsedConfigInterface = JSON.parse(readFileSync("./config.json", "utf8"));
    Object.assign(config, parsed);

    for (let prop in parsed) {
        if (prop == null) {
            ConsoleContext.warn(`Fallback property value used for property ${prop} in config.json. Fallback value is ${defaultConfig[prop]}.`);
        }
    }
} catch {
    ConsoleContext.error(new Error("Could not parse config file. Config is now set to fallback."));
    config = defaultConfig;
}

const { PORT, SONGS_DIR } = config;
export const { MAX_FFMPEG_WORKER_THREADS } = config;

// validate path syntax
try {
    path.parse(SONGS_DIR);
} catch {
    throw new Error("Property SONGS_DIR is not a valid path in config.json");
}



async function getAllSongs(): Promise<Song[]> {
    const dirEntries = await readdir(SONGS_DIR, { withFileTypes: true });
    const files = dirEntries
        .filter(dirent => dirent.isFile())
        .map(async dirent => await Song.create(path.resolve(path.join(SONGS_DIR, dirent.name))));

    return await Promise.all(files);
}

async function transcodeAllSongs(): Promise<Song[]> {
    return await transcodeSongs(await getAllSongs());
}

ConsoleContext.log("Transcoding songs... (2/3)");
const transcodedSongs = await transcodeAllSongs();
ConsoleContext.log("Initalising radio... (3/3)");

// initialise radio
const radio = new Radio(
    transcodedSongs, 
    { 
        loop: config.LOOP,
        shuffle: config.SHUFFLE,
        bufferSize: config.BUFFER_KB,
        RING_BUFFER_MS: config.RING_BUFFER_MS,
    }
);

ConsoleContext.log("Ready.");
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