import Song from "../Song.js"
import path, { dirname } from "path";
import { existsSync } from "fs";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { convert } from "./FFmpeg.js";

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(path.join(__dirname, "../output"));

let MAX_FFMPEG_WORKER_THREADS = 5;
let instances: number = 0;

/**
 * Transcodes songs to MP3
 */
export async function transcodeSongs(songs: Song[]): Promise<Song[]> {
    if (!existsSync(OUTPUT_PATH)) {
        await fs.mkdir(OUTPUT_PATH);
    }

    await deleteAllFilesInDirectory(OUTPUT_PATH);

    const outputSongs = songs.map(song => {
        return transcode(song);
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

async function transcode(song: Song): Promise<Song> {
    await waitTillInstanceIsFree();
    instances++;

    const outputFilePath = path.join(OUTPUT_PATH, `${song.filename.noExtension}.mp3`);

    // exit if file is already mp3
    if (path.extname(song.filename.full!) === ".mp3") return song;

    await convert(song.dir, outputFilePath);

    instances--;
    return Song.create(outputFilePath);
}

async function deleteAllFilesInDirectory(dir: string): Promise<void> {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        await fs.unlink(filePath);
    }
}