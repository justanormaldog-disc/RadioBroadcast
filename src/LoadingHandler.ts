import { ColourCodes, eraseline, foreground, nextline, prevline, reset, restore, save } from "./ANSIColourEscapeSequence.js";
import { ConsoleContext } from "./Console.js";

export type ResultMap = Record<string, any>;
type CallbackFn = (handler: LoadingHandler, results: ResultMap, ...rest: any[]) => any;

interface LoadCompletionRecord {
    result: any,
    performance: PerformanceStat
}

class PerformanceStat {
    start: number;
    end: number;
    duration: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
        this.duration = end - start;
    }
}

export class LoadEvent {
    callback: CallbackFn;
    name: string;
    id: string;
    parameters: any[];

    constructor(callback: CallbackFn, name: string, id: string, parameters: any[]) {
        this.callback = callback;
        this.name = name;
        this.id = id;
        this.parameters = parameters;
    }
}

export class LoadingHandler {
    events: LoadEvent[];
    status: string;

    constructor(events: LoadEvent[]) {
        this.events = events;
        this.status = "";
    }

    /**
     * Loads all {@link LoadingHandler.events LoadEvents}
     */
    async load(): Promise<ResultMap> {
        const results: ResultMap = {};

        const start = performance.now();

        for (const [i, event] of this.events.entries()) {
            // move to bottom of terminal
            nextline(999);
            
            ConsoleContext.log(`${event.name} (${i + 1}/${this.events.length})`);

            if (this.status) {
                this.logStatus();
                save();
            }

            const eventStart = performance.now();

            const dotInterval = setInterval(() => {
                const dots = Math.floor((performance.now() - eventStart) / 1000);
                this.setStatus(".".repeat(dots));
            }, 100);

            const callback = this.loadEvent(event, results);
            callback
                .then((record: LoadCompletionRecord) => {
                    const { result, performance: perf } = record;

                    // add result to object
                    results[event.id] = result;
                
                    if (this.status) {
                        // Erase the status
                        restore();
                        ConsoleContext.raw(eraseline() + "\r");
                    }
                    // Clear dot interval
                    clearInterval(dotInterval);

                    // Erase the previous line (the loading message)
                    ConsoleContext.raw(prevline() + eraseline());

                    // Log new message
                    ConsoleContext.log(`${event.name} ${Math.round(perf.duration)}ms ${foreground(ColourCodes.GREEN)}Done${reset()}`);
                });
            
            await callback;
        }

        const end = performance.now();
        const perf = new PerformanceStat(start, end);
        ConsoleContext.log(`${foreground(ColourCodes.GREEN)}Ready${reset()} ${Math.round(perf.duration)}ms`);

        const wait: Promise<void> = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 10000);
        });

        await wait;

        return results;
    }

    /**
     * Sets the current status of the event that is currently being loaded.
     */
    setStatus(msg: string): void {
        if (msg === this.status) return;

        this.status = msg;

        // Erase the previous status
        restore();
        ConsoleContext.raw(eraseline());

        // Write new status
        this.logStatus();
        save();
        // move to bottom of terminal
        nextline(999);      
    }

    private logStatus(): void {
        ConsoleContext.raw("\r" + this.status);
    }

    private async loadEvent(event: LoadEvent, prevResults: ResultMap): Promise<LoadCompletionRecord> {
        const start = performance.now();

        const { callback, parameters } = event;
        const result = await callback(this, prevResults, ...parameters);

        const end = performance.now();

        return {
            result,
            performance: new PerformanceStat(start, end)
        }
    }
}