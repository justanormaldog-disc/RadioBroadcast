export class Queue<T> {
    head: QueueElement<T> | null;
    tail: QueueElement<T> | null;
    private _size: number;

    constructor(inital?: T[]) {
        this.head = null;
        this.tail = null;
        this._size = 0;

        if (inital) this.importFromArray(inital);
    }

    /**
     * Appends an element(s) to the end of the queue.
     * 
     * Returns the appended queue element(s).
     */
    enqueue(...elements: T[]) {
        return elements.map((el: T) => this._enqueue(el));
    }

    private _enqueue(element: T): T {
        const queueEl = new QueueElement(element);
        this._size++;

        if (this.isEmpty()) {
            this.head = queueEl;
            this.tail = queueEl;

            return queueEl.value;
        }

        this.tail!.next = queueEl;
        this.tail = queueEl;

        return queueEl.value;
    }

    /**
     * Removes and returns the first element in the queue.
     * 
     * Returns undefined when queue is empty.
     */
    dequeue(): T | undefined {
        if (this.isEmpty()) return;

        const removed: QueueElement<T> = this.head!;

    
        this.head = this.head!.next;
        if (!this.head) this.tail = null;

        this._size--;
        return removed.value;
    }

    /**
     * Returns the first element in the queue.
     * 
     * Returns undefined if the queue is empty.
     */
    peek(): T | undefined {
        if (this.isEmpty()) return;

        return this.head!.value;
    }

    isEmpty() {
        return this.head === null;
    }

    /**
     * Returns the number of elements indexed from 1 in the queue.
     */
    size() {
        return this._size;
    }

    /**
     * Returns the queue as a JSON array.
     */
    json(): T[] {
        let queue: T[] = [];

        let current = this.head;
        for (let i = 0; i < this.size(); i++) {
            queue.push(current!.value);
            current = current!.next;
        }

        return queue;
    }

    private importFromArray(array: T[]): void {
        for (let i = 0; i < array.length; i++) {
            this.enqueue(array[i]);
        }
    }

    /**
     * 
     * @returns Returns a new empty queue.
     */
    static empty<T>(): Queue<T> {
        return new Queue<T>();
    }
}

export class QueueElement<T> {
    next: QueueElement<T> | null;
    value: T;

    constructor(v: T) {
        this.next = null;
        this.value = v;
    }
}