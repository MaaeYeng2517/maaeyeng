interface Node<T> {
    value: T;
    left: Node<T> | null;
    right: Node<T> | null;
}
class BinarySearchTree<T> {
    root: Node<T> | null;

    constructor() {
        this.root = null;
    }

    // Insert a new value into the BST
    insert(value: T): void {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            return;
        }

        let currentNode = this.root;
        while (true) {
            if (value < currentNode.value) {
                if (!currentNode.left) {
                    currentNode.left = newNode;
                    return;
                }
                currentNode = currentNode.left;
            } else if (value > currentNode.value) {
                if (!currentNode.right) {
                    currentNode.right = newNode;
                    return;
                }
                currentNode = currentNode.right;
            } else {
                // Handle duplicate values (e.g., ignore or store in a list at the node)
                return; 
            }
        }
    }

    // Search for a value in the BST
    search(value: T): boolean {
        if (!this.root) {
            return false;
        }
        let currentNode = this.root;
        while (currentNode) {
            if (value === currentNode.value) {
                return true;
            } else if (value < currentNode.value) {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }
        }
        return false;
    }

    // Example of an in-order traversal (left, root, right)
    inOrderTraversal(node: Node<T> | null = this.root): void {
        if (node) {
            this.inOrderTraversal(node.left);
            console.log(node.value);
            this.inOrderTraversal(node.right);
        }
    }
}