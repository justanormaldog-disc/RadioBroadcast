import { parseFile } from "music-metadata";
export default class Song {
    dir;
    title;
    artist;
    bitrate;
    constructor(dir, title, artist, bitrate) {
        this.dir = dir;
        this.title = title;
        this.artist = artist;
        this.bitrate = bitrate;
    }
    /**
     * Creates a new Song instance from a valid directory path.
     *
     * This static method should be used to construct a new instance instead of the new keyword.
     */
    static async create(dir) {
        const metadata = await parseFile(dir);
        const title = metadata.common.title;
        const artist = metadata.common.artist;
        const bitrate = metadata.format.bitrate;
        if (bitrate === undefined)
            throw new Error("Bitrate is undefined.");
        return new Song(dir, title, artist, bitrate);
    }
}
