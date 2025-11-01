import Song from "../Song.js"
import path, { dirname } from "path";
import { existsSync } from "fs";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { convert } from "./FFmpeg.js";
import { LoadingHandler } from "../Loader/LoadingHandler.js";

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(path.join(__dirname, "../output"));

let MAX_FFMPEG_WORKER_THREADS = 5;
let instances: number = 0;
let songsTranscoded: number = 0;
let maxSongs: number = 0;

/**
 * Transcodes songs to MP3
 */
export async function transcodeSongs(handler: LoadingHandler, songs: Song[]): Promise<Song[]> {
    if (!existsSync(OUTPUT_PATH)) {
        await fs.mkdir(OUTPUT_PATH);
    }

    await deleteAllFilesInDirectory(OUTPUT_PATH);

    songsTranscoded = 0;
    maxSongs = songs.length;

    const outputSongs = songs.map(song => {
        return transcode(handler, song);
    });

    return Promise.all(outputSongs);
}

export function setMaxFFmpegThreads(threads: number): void {
    MAX_FFMPEG_WORKER_THREADS = threads;
}

function waitTillInstanceIsFree(): Promise<void> {
    return new Promise((resolve) => {
        const interval = setInterval(callback, 50);

        function callback() {
            if (instances < MAX_FFMPEG_WORKER_THREADS) {
                clearInterval(interval);
                resolve();
            }
        }
    });
}

async function transcode(handler: LoadingHandler, song: Song): Promise<Song> {
    // exit if file is already mp3
    if (path.extname(song.filename.full!) === ".mp3") return song;
    
    await waitTillInstanceIsFree();
    instances++;

    handler.setStatus(`Transcoding ${song.filename.full}`.padEnd(50, " ") + ` (${songsTranscoded}/${maxSongs})`);

    const outputFilePath = path.join(OUTPUT_PATH, `${song.filename.noExtension}.mp3`);

    await convert(song.dir, outputFilePath);

    instances--;
    songsTranscoded++;
    handler.setStatus(`Transcoded ${song.filename.full}`.padEnd(50, " ") + ` (${songsTranscoded}/${maxSongs})`);
    return Song.create(outputFilePath);
}

async function deleteAllFilesInDirectory(dir: string): Promise<void> {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        await fs.unlink(filePath);
    }
}