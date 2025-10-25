export default class Queue {
    head;
    tail;
    _size;
    constructor(inital) {
        this.head = null;
        this.tail = null;
        this._size = 0;
        if (inital)
            this.importFromArray(inital);
    }
    /**
     * Appends an element(s) to the end of the queue.
     *
     * Returns the appended queue element(s).
     */
    enqueue(...elements) {
        return elements.map((el) => this._enqueue(el));
    }
    _enqueue(element) {
        const queueEl = new QueueElement(element);
        this._size++;
        if (this.isEmpty()) {
            this.head = queueEl;
            this.tail = queueEl;
            return queueEl.value;
        }
        this.tail.next = queueEl;
        this.tail = queueEl;
        return queueEl.value;
    }
    /**
     * Removes and returns the first element in the queue.
     *
     * Returns undefined when queue is empty.
     */
    dequeue() {
        if (this.isEmpty())
            return;
        const removed = this.head;
        this.head = this.head.next;
        if (!this.head)
            this.tail = null;
        this._size--;
        return removed.value;
    }
    /**
     * Returns the first element in the queue.
     *
     * Returns undefined if the queue is empty.
     */
    peek() {
        if (this.isEmpty())
            return;
        return this.head.value;
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
    json() {
        let queue = [];
        let current = this.head;
        for (let i = 0; i < this.size(); i++) {
            queue.push(current.value);
            current = current.next;
        }
        return queue;
    }
    importFromArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.enqueue(array[i]);
        }
    }
    /**
     *
     * @returns Returns a new empty queue.
     */
    static empty() {
        return new Queue();
    }
}
class QueueElement {
    next;
    value;
    constructor(v) {
        this.next = null;
        this.value = v;
    }
}
