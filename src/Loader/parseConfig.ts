import { LoadingHandler, ResultMap } from "../Loader/LoadingHandler.js";
import { setMaxFFmpegThreads } from "../FFmpeg/transcode.js";
import { ConsoleContext } from "../Console/Console.js";
import { readFileSync } from "fs";

export interface ConfigInterface {
    PORT: number,
    SONGS_DIR: string,
    LOOP: boolean,
    SHUFFLE: boolean,
    BUFFER_KB: number,
    RING_BUFFER_MS: number,
    MAX_FFMPEG_WORKER_THREADS: number,
}

interface ParsedConfigInterface {
    PORT: number | undefined,
    SONGS_DIR: string | undefined,
    LOOP: boolean | undefined,
    SHUFFLE: boolean | undefined,
    BUFFER_KB: number | undefined,
    RING_BUFFER_MS: number | undefined,
    MAX_FFMPEG_WORKER_THREADS: number | undefined,
}



export function parseConfig(handler: LoadingHandler, results: ResultMap, path: string, defaultConfig: ConfigInterface): ConfigInterface {
    let config: ConfigInterface = defaultConfig;

    try {
        const parsed: ParsedConfigInterface = JSON.parse(readFileSync(path, "utf8"));
        Object.assign(config, parsed);

        for (let prop in parsed) {
            if (prop == null) {
                ConsoleContext.warn(`Fallback property value used for property ${prop} in config.json. Fallback value is ${defaultConfig[prop]}.`);
            }
        }
    } catch {
        ConsoleContext.error(new Error("Could not parse config file. Config is now set to fallback."));
        config = defaultConfig;
    }

    setMaxFFmpegThreads(config.MAX_FFMPEG_WORKER_THREADS);
    return config;
}