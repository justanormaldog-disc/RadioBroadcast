import { transcodeSongs } from "../FFmpeg/transcode.js";
import { readdir } from "fs/promises";
import Song from "../Song.js";
import path from "path";
import { LoadingHandler, ResultMap } from "../Loader/LoadingHandler.js";

async function getAllSongs(SONGS_DIR: string): Promise<Song[]> {
    // validate path
    try {
        path.parse(SONGS_DIR);
    } catch {
        throw new Error("Property SONGS_DIR is not a valid path in config.json");
    }
    
    const dirEntries = await readdir(SONGS_DIR, { withFileTypes: true });
    const files = dirEntries
        .filter(dirent => dirent.isFile())
        .map(async dirent => await Song.create(path.resolve(path.join(SONGS_DIR, dirent.name))));

    return await Promise.all(files);
}

export async function transcodeAllSongs(handler: LoadingHandler, results: ResultMap): Promise<Song[]> {
    const SONGS_DIR = results.config.SONGS_DIR;
    return await transcodeSongs(await getAllSongs(SONGS_DIR));
}