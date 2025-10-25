import { PassThrough } from "stream";
import Song from "./Song.js";
import Queue from "./Queue.js";
import { shuffle } from "./shuffle.js";
import { Throttle } from "stream-throttle";
import { createReadStream } from "fs";
import ResponseSink from "./ResponseSink.js";

type SongList = Song[];

enum StreamStatus {
    INACTIVE,
    ACTIVE,
    ERROR,
}

interface config {
    loop: boolean,
}


/**
 * A class implementation for a continuous stream akin to a radio station
 */
export class Radio {
    private streamStart: number | null;
    private _streamStatus: StreamStatus;
    queue: Queue<Song>;
    songs: SongList;
    config: config;
    sinks: ResponseSink[];

    constructor(songs: SongList, config: config) {
        this.streamStart = null;
        this._streamStatus = StreamStatus.INACTIVE;

        this.config = config;
        
        this.queue = new Queue(songs);
        this.songs = songs;

        this.sinks = []; // list of listeners to write data to
    }

    /**
     * Starts the stream.
     */
    start(): void {
        if (this.streamStatus() === StreamStatus.ACTIVE) {
            throw new Error("Stream is already running.");
        }

        this.streamStart = Date.now();
        this.setStreamStatus(StreamStatus.ACTIVE);

        const current = this.current();

        if (!current) {
            console.warn("No songs are in queue.");
            this.setStreamStatus(StreamStatus.INACTIVE);
            return;
        }

        const bitrate = current.bitrate;
        const readable = createReadStream(current.dir);
 
        if (bitrate === 0) throw new Error(`Bitrate is 0: ${current.dir}`);

        console.log(bitrate);
        const throttle = new Throttle({
            rate: bitrate / 8,
        });

        readable.pipe(throttle)
            .on("data", (chunk: any) => {
                this.broadcastToAllSinks(chunk);
            })
            .on("end", () => {
                this.next();
                this.setStreamStatus(StreamStatus.INACTIVE);
                this.start();
            });
    }

    /**
     * Shuffles the queue.
     */
    shuffle(): void {
        this.queue = new Queue(shuffle(this.queue.json()));
    }

    next(): void {
        this.queue.dequeue();
    }

    current(): Song | undefined {
        return this.queue.peek();
    }

    add(song: Song): Song {
        return this.queue.enqueue(song)[0];
    }

    /**
     * Returns the miliseconds since the stream started.
     * 
     * If the stream has not started, the return value will be 0.
     */
    runningMs(): number {
        if (this.streamStart === null) {
            return 0; // stream hasn't started
        }

        return Date.now() - this.streamStart;
    }

    /**
     * Returns an {@link StreamStatus} enum based on the current status.
     */
    streamStatus(): StreamStatus {
        return this._streamStatus;
    }

    /**
     * Creates a sink to write data to.
     */
    createResponseSink(): ResponseSink {
        const responseSink = new ResponseSink();
        this.sinks.push(responseSink);
        return responseSink;
    }

    /**
     * Remove a pre-existing sink.
     */
    removeResponseSink(id: string) {
        const i = this.sinks.findIndex(sink => sink.id === id);
        return this.sinks.splice(i, 1)[0];
    }

    private setStreamStatus(status: StreamStatus) {
        this._streamStatus = status;
    }

    /**
     * Writes to every sink.
     */
    private broadcastToAllSinks(chunk: any) {
        for (const sink of this.sinks) {
            sink.write(chunk);
        }
    }
}

