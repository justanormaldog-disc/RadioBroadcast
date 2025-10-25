import express from "express";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";

import path from "path";
import { Radio } from "./Radio.js";
import Song from "./Song.js";

const app = express();

let defaultConfig = {
    PORT: 3000,
    SONGS_DIR: "/songs",
    LOOP: true,
}

// Fetch configuration file

let config;

try {
    config = JSON.parse(readFileSync("./config.json", "utf8"));

    if (
        config?.PORT === undefined ||
        config?.SONGS_DIR === undefined ||
        config?.LOOP === undefined
    ) {
        throw new Error();
    }
} catch {
    console.error("Could not parse config file. Config is now set to fallback.");
    config = defaultConfig;
}

const { PORT, SONGS_DIR } = config;

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
        .map(async dirent => await Song.create(path.join(SONGS_DIR, dirent.name)));

    return await Promise.all(files);
}

// initialise radio
const radio = new Radio(await getAllSongs(), { loop: config.LOOP });
radio.start();

app.get("/", async (req, res) => {
    res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
    });

    console.log(`Client connected [${(new Date()).toTimeString().split(' ')[0]}]`);

    const sink = radio.createResponseSink();
    sink.pipe(res);

    res.on("close", () => {
        console.log(`Client disconnected [${(new Date()).toTimeString().split(' ')[0]}]`);
        radio.removeResponseSink(sink.id);
    })
})

app.listen(PORT, () => {
    console.log(`Streaming at http://localhost:${PORT}`);
})