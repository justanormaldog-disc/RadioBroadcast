import { PassThrough } from "stream";
import Song from "./Song.js";
import { Queue } from "./Queue.js";
import { shuffle } from "./shuffle.js";
import { Throttle } from "stream-throttle";
import { createReadStream, ReadStream } from "fs";
import ResponseSink from "./ResponseSink.js";

type SongList = Song[];

export enum StreamStatus {
    INACTIVE,
    ACTIVE,
    FATALERROR,
}

interface config {
    loop: boolean,
    shuffle: boolean,
    bufferSize: number,
    RING_BUFFER_MS: number,
}

/**
 * A class implementation for a continuous stream akin to a radio station
 */
export class Radio {
    private streamStart: number | null;
    private _streamStatus: StreamStatus;

    private buffer: PassThrough | null;
    private bufferKb: number;

    private bufferedChunks: Buffer[];
    private totalBufferedBytes: number;

    readBytes: number;

    queue: Queue<Song>;
    songs: SongList;
    config: config;
    sinks: ResponseSink[];
    throttle: Throttle | null;
    
    /**
     * 
     * @param songs List of songs to play
     * @param config {@link config Configuration interface}
     */
    constructor(songs: SongList, config: config) {
        this.streamStart = null;
        this._streamStatus = StreamStatus.INACTIVE;

        this.config = config;

        this.songs = config.shuffle ? shuffle(songs) : songs;
        this.queue = new Queue(this.songs);

        this.readBytes = 0;

        this.throttle = null;

        this.buffer = null;
        this.bufferKb = config.bufferSize;

        this.bufferedChunks = [];
        this.totalBufferedBytes = 0;


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

        let current = this.current();

        if (!current) {
            if (!this.config.loop || this.songs.length === 0) {
                console.warn("No songs are in queue.");
                this.setStreamStatus(StreamStatus.INACTIVE);
                return;
            }

            let songs = this.config.shuffle ? shuffle(this.songs) : this.songs;

            /* 
            Do not switch to reassignment, it will not work 
            as expected as all references to this queue will break.
            */
            songs.forEach((song: Song) => this.queue.enqueue(song));
            current = this.current()!; // this will only be null if this.songs.length === 0.
        }

        this.readBytes = 0;

        const bitrate = current.bitrate;
        const byterate = bitrate / 8;

        const readable = createReadStream(current.dir);
 
        if (bitrate === 0) throw new Error(`Bitrate is 0: ${current.dir}`);

        const throttle = this.throttle = new Throttle({
            rate: byterate,
        });

        

        this.buffer = new PassThrough({
            highWaterMark: this.bufferKb * 1024
        });

        readable.pipe(throttle).pipe(this.buffer);

        this.setStreamStatus(StreamStatus.ACTIVE);

        this.buffer
            .on("data", (chunk: Buffer) => {
                this.broadcastToAllSinks(chunk);

                // save in buffered chunks for replay when a new sink connects
                this.bufferedChunks.push(chunk);
                this.totalBufferedBytes += chunk.length;
                this.readBytes += chunk.length;
                // trim to max size
                while (this.totalBufferedBytes > this.config.RING_BUFFER_MS * (byterate / 1000)) {
                    const removed: Buffer = this.bufferedChunks.shift()!;
                    this.totalBufferedBytes -= removed.length;
                }

                
            })
            .on("end", () => {
                this.next();
                this.setStreamStatus(StreamStatus.INACTIVE);

                setImmediate(() => this.start());
            })
            .on("error", err => {
                console.error(err);
                
                this.next();
                setImmediate(() => this.start());
            })
    }

    /**
     * Destroys the stream.
     */
    reset() {
        if (this.streamStatus() !== StreamStatus.ACTIVE) {
            throw new Error("No stream is running");
        }

        this.buffer!.destroy();
        this.throttle!.destroy();

        this.buffer = null;
        this.throttle = null;

        this.setStreamStatus(StreamStatus.INACTIVE);
    }

    /**
     * Shuffles the queue.
     */
    shuffle(): void {
        this.reset();

        const shuffled = shuffle(this.queue.json());

        /* DO NOT CHANGE TO REASSIGNMENT; THIS IS NOT EQUAL TO this.queue = new Queue(shuffled);

        A reassignment will give the queue a new reference which will break the GUI as it WILL
        be stuck with the old reference.
        i.e DO NOT TOUCH
        */
        let current = this.queue.head;
        for (let i = 0; i < shuffled.length; i++) {
            if (current === null) break;

            current.value = shuffled[i];

            if (current.next === null) break;
            current = current.next;
        }

        this.start();
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

        // write last 5 seconds of data as a buffer
        for (const chunk of this.bufferedChunks) {
            responseSink.write(chunk)
        }

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
    private broadcastToAllSinks(chunk: Buffer) {
        for (const sink of this.sinks) {
            sink.write(chunk);
        }
    }
}

