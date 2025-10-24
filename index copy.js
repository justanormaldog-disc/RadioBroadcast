import express from "express";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { PassThrough } from "stream";
import { shuffle } from "./shuffle.js";

const app = express();
const PORT = 3000;
const SONGS_DIR = path.resolve("./songs");

let currentSongIdx = 0;
let broadcast = new PassThrough();
const clients = new Set();

// Load and validate songs dir
try {
  const stats = await fsp.stat(SONGS_DIR);
  if (!stats.isDirectory()) throw new Error();
} catch {
  throw new Error(`SONGS_DIR (${SONGS_DIR}) must be an existing directory`);
}

// Client connects to stream
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");

  broadcast.pipe(res);
  clients.add(res);
  console.log(`Client connected (${clients.size} total)`);

  req.on("close", () => {
    broadcast.unpipe(res);
    clients.delete(res);
    console.log(`Client disconnected (${clients.size} remaining)`);
  });
});

app.listen(PORT, () => {
  console.log(`Streaming 24/7 at http://localhost:${PORT}`);
  startBroadcast();
});

// --- Playback Logic ---
async function getAllSongs() {
  const entries = await fsp.readdir(SONGS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith(".mp3"))
    .map(e => path.join(SONGS_DIR, e.name));
}

async function startBroadcast() {
  const songs = await getAllSongs();
  if (songs.length === 0) {
    console.error("No MP3s in songs directory.");
    return;
  }

  shuffle(songs);

  while (true) {
    const songPath = songs[currentSongIdx];
    console.log(`Now playing: ${path.basename(songPath)}`);

    try {
      await new Promise((resolve, reject) => {
        const stream = fs.createReadStream(songPath);
        stream.pipe(broadcast, { end: false });
        stream.on("end", resolve);
        stream.on("error", reject);
      });
    } catch (err) {
      console.error("Stream error:", err);
    }

    currentSongIdx = (currentSongIdx + 1) % songs.length;
  }
}
