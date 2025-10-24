import express from "express";
import fs from "fs";
import fsp from "fs/promises";
import { shuffle } from "./shuffle.js";

import path from "path";

const app = express();

let config = {
    PORT: 3000,
    SONGS_DIR: "/songs",
}

try {
    config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
} catch {
    console.error("Could not parse config file. Config is now set to fallback");
}

const { PORT, SONGS_DIR } = config;

// validate path syntax
try {
    path.parse(SONGS_DIR);
} catch {
    throw new Error("Property SONGS_DIR is not a valid path in config.json");
}

async function getAllSongs() {
    const dirEntries = await fsp.readdir(SONGS_DIR, { withFileTypes: true });
    const files = dirEntries
        .filter(dirent => dirent.isFile())
        .map(dirent => path.join(SONGS_DIR, dirent.name));

    return files;
}


function pipeSong(res, songs, i) {
    if (songs.length === 0) {
        res.status(404).send("No songs in " + SONGS_DIR);
        return;
    }

    const stream = fs.createReadStream(songs[i]);

    stream.pipe(res, { end: false });

    stream.on("end", () => {
        // Next song / loop to start
        pipeSong(res, songs, (i + 1) % songs.length);
    });

    stream.on("close", () => {
        stream.destroy(); // end stream when client disconnects
    })
}

app.get("/", async (req, res) => {
    res.setHeader("Content-Type", "audio/mpeg");
    let songs = await getAllSongs();
    shuffle(songs);

    pipeSong(res, songs, 0);
    console.log(`Client connected [${(new Date()).toTimeString().split(' ')[0]}]`);

    res.on("close", () => {
        console.log(`Client disconnected [${(new Date()).toTimeString().split(' ')[0]}]`);
    })
})

app.listen(PORT, () => {
    console.log(`Streaming at http://localhost:${PORT}`);
})