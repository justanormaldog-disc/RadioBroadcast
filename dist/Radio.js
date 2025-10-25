import { Queue } from "./Queue.js";
import { shuffle } from "./shuffle.js";
import { Throttle } from "stream-throttle";
import { createReadStream } from "fs";
import ResponseSink from "./ResponseSink.js";
var StreamStatus;
(function (StreamStatus) {
    StreamStatus[StreamStatus["INACTIVE"] = 0] = "INACTIVE";
    StreamStatus[StreamStatus["ACTIVE"] = 1] = "ACTIVE";
    StreamStatus[StreamStatus["ERROR"] = 2] = "ERROR";
})(StreamStatus || (StreamStatus = {}));
/**
 * A class implementation for a continuous stream akin to a radio station
 */
export class Radio {
    streamStart;
    _streamStatus;
    queue;
    songs;
    config;
    sinks;
    constructor(songs, config) {
        this.streamStart = null;
        this._streamStatus = StreamStatus.INACTIVE;
        this.config = config;
        this.songs = config.shuffle ? shuffle(songs) : songs;
        this.queue = new Queue(this.songs);
        this.sinks = []; // list of listeners to write data to
    }
    /**
     * Starts the stream.
     */
    start() {
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
        if (bitrate === 0)
            throw new Error(`Bitrate is 0: ${current.dir}`);
        const throttle = new Throttle({
            rate: bitrate / 8,
        });
        readable.pipe(throttle)
            .on("data", (chunk) => {
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
    shuffle() {
        const shuffled = shuffle(this.queue.json());
        /* DO NOT CHANGE TO REASSIGNMENT; THIS IS NOT EQUAL TO this.queue = new Queue(shuffled);

        A reassignment will give the queue a new reference which will break the GUI as it WILL
        be stuck with the old reference.
        i.e DO NOT TOUCH
        */
        let current = this.queue.head;
        for (let i = 0; i < shuffled.length; i++) {
            if (current === null)
                break;
            current.value = shuffled[i];
            if (current.next === null)
                break;
        }
    }
    next() {
        this.queue.dequeue();
    }
    current() {
        return this.queue.peek();
    }
    add(song) {
        return this.queue.enqueue(song)[0];
    }
    /**
     * Returns the miliseconds since the stream started.
     *
     * If the stream has not started, the return value will be 0.
     */
    runningMs() {
        if (this.streamStart === null) {
            return 0; // stream hasn't started
        }
        return Date.now() - this.streamStart;
    }
    /**
     * Returns an {@link StreamStatus} enum based on the current status.
     */
    streamStatus() {
        return this._streamStatus;
    }
    /**
     * Creates a sink to write data to.
     */
    createResponseSink() {
        const responseSink = new ResponseSink();
        this.sinks.push(responseSink);
        return responseSink;
    }
    /**
     * Remove a pre-existing sink.
     */
    removeResponseSink(id) {
        const i = this.sinks.findIndex(sink => sink.id === id);
        return this.sinks.splice(i, 1)[0];
    }
    setStreamStatus(status) {
        this._streamStatus = status;
    }
    /**
     * Writes to every sink.
     */
    broadcastToAllSinks(chunk) {
        for (const sink of this.sinks) {
            sink.write(chunk);
        }
    }
}
