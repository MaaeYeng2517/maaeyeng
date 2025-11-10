// Define the Node interface
interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

// Implement the Linked List class
class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  size: number = 0;

  // Add a new node to the end of the list
  append(value: T): void {
    const newNode: ListNode<T> = { value, next: null };
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  // Add a new node to the beginning of the list
  prepend(value: T): void {
    const newNode: ListNode<T> = { value, next: this.head };
    this.head = newNode;
    if (!this.tail) {
      this.tail = newNode;
    }
    this.size++;
  }

  // Remove a node by its value
  remove(value: T): boolean {
    if (!this.head) {
      return false;
    }

    if (this.head.value === value) {
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.size--;
      return true;
    }

    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
      if (!current.next) { // If the removed node was the tail
        this.tail = current;
      }
      this.size--;
      return true;
    }
    return false;
  }

  // Find a node by its value
  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  // Convert the linked list to an array
  toArray(): T[] {
    const elements: T[] = [];
    let current = this.head;
    while (current) {
      elements.push(current.value);
      current = current.next;
    }
    return elements;
  }
}