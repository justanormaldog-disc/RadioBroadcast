import { PassThrough } from "stream"

/**
 * Extends {@link PassThrough} with an unique identifier assigned to each instance
 */
export default class ResponseSink extends PassThrough {
    id: string;
    constructor() {
        super();
        this.id = crypto.randomUUID();
    }
}