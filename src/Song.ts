import { stat  } from "fs/promises";
import { parse } from "path";
import { parseFile } from "music-metadata";
import path from "path";

interface Filename {
    full: string | undefined,
    noExtension: string | undefined,
}

export default class Song {
    constructor(
        public dir: string,
        public title: string | undefined,
        public artist: string | undefined,
        public filename: Filename,
        public bitrate: number,
        public bytes: number,
    ) {}

    /**
     * Creates a new Song instance from a valid directory path.
     * 
     * This static method should be used to construct a new instance instead of the new keyword.
     */
    static async create(dir: string): Promise<Song> {
        const metadata = await parseFile(dir);

        
        const title = metadata.common.title;
        const artist = metadata.common.artist;
        const bytes = (await stat(dir)).size;

        let filename = {
            full: path.basename(dir),
            noExtension: parse(dir).name,
        }

        const bitrate = metadata.format.bitrate;
        if (bitrate === undefined) throw new Error("Bitrate is undefined.");

        return new Song(dir, title, artist, filename, bitrate, bytes);
    }
}

