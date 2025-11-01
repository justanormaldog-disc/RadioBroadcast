import { Radio } from "../Radio/Radio.js";
import { LoadingHandler, ResultMap } from "../Loader/LoadingHandler.js";

export function initRadio(handler: LoadingHandler, results: ResultMap) {
    const config = results.config;
    const transcodedSongs = results.transcode;

    return new Radio(
        transcodedSongs, 
        { 
            loop: config.LOOP,
            shuffle: config.SHUFFLE,
            bufferSize: config.BUFFER_KB,
            RING_BUFFER_MS: config.RING_BUFFER_MS,
        }
    );
}