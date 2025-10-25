import { parseFile } from "music-metadata";

export default class Song {
    constructor(
        public dir: string,
        public title: string | undefined,
        public artist: string | undefined,
        public bitrate: number,
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


        const bitrate = metadata.format.bitrate;
        if (bitrate === undefined) throw new Error("Bitrate is undefined.");

        return new Song(dir, title, artist, bitrate);
    }
}

