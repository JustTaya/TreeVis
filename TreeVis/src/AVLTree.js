class AVLNode extends BinarySearchNode {
    constructor(nodeKey, nodeParent) {
        super(nodeKey, nodeParent);
        this._height = 1;
    }

    get balanceFactor() {
        if (this.right == null && this.left == null)
            return 0;
        else if (this.right == null)
            return this.left.height;
        else if (this.left == null)
            return -this.right.height;
        else
            return this.left.height - this.right.height;
    }

    setHeight() {
        if (this.right == null && this.left == null)
            this._height = 1;
        if (this.right == null) {
            if (this.left != null) {
                this._height = this.left.height + 1;
            }
        } else if (this.left == null) {
            this._height = this.right.height + 1;
        } else {
            this._height = ((this.left._height > this.right._height) ? (this.left._height + 1) : (this.right._height + 1));
        }
    }

    get height() {
        this.setHeight();
        return this._height;
    }
}

class AVLTree extends BinarySearchTree {
    constructor() {
        super();
    }

    async insertKey(newKey) {
        let node = new AVLNode(newKey, null);
        await super._insertNode(node);
        let current = node;
        while (current != null) {
            current = current.parent;
            await this._balance(current, newKey);
        }
        await treeView.updateView(makeMatrix(this));
    }

    async deleteKey(key) {
        this.deletedView = null;
        this._root = await this._deleteKey(this._root, key);
        if (this.deletedView != null) {
            treeView.endDeletion(makeMatrix(this), this.deletedView);
        }
    }

    async _balance(node, key) {
        if (node == null)
            return null;
        node.setHeight();
        //left left case
        if (node.balanceFactor > 1 && node.left != null && key < node.left.key) {
            await this._rotateRight(node);
        }
        //right right case
        if (node.balanceFactor < -1 && node.right != null && key >= node.right.key) {
            await this._rotateLeft(node);
        }
        //left right case
        if (node.balanceFactor > 1 && node.left != null && key >= node.left.key) {
            await this._rotateLeft(node.left);
            await this._rotateRight(node);
        }
        //right left case
        if (node.balanceFactor < -1 && node.right != null && key < node.right.key) {
            await this._rotateRight(node.right);
            await this._rotateLeft(node);
        }
    }

    async _rotateLeft(node) {
        let rightChild = node.right;
        node.right = rightChild.left;
        if (node.right != null) {
            node.right.parent = node;
        }
        rightChild.parent = node.parent;
        if (node.parent === null) {
            this._root = rightChild;
        } else if (node === node.parent.left) {
            node.parent.left = rightChild;
        } else {
            node.parent.right = rightChild;
        }
        rightChild.left = node;
        node.parent = rightChild;

        await treeView.rotateAround(node, makeMatrix(this));
    }

    async _rotateRight(node) {
        let leftChild = node.left;
        node.left = leftChild.right;
        if (node.left != null)
            node.left.parent = node;
        leftChild.parent = node.parent;
        if (node.parent == null)
            this._root = leftChild;
        else if (node === node.parent.left)
            node.parent.left = leftChild;
        else
            node.parent.right = leftChild;
        leftChild.right = node;
        node.parent = leftChild;

        await treeView.rotateAround(node, makeMatrix(this));
    }

    async _deleteKey(node, key) {
        if (node == null) {
            return null;
        }
        await treeView.findNode(node).blink(colors['green']);
        if (key < node.key) {
            node.left = await this._deleteKey(node.left, key);
        } else if (key > node.key) {
            node.right = await this._deleteKey(node.right, key);
        } else {
            await treeView.findNode(node).blink(colors['yellow']);
            this.deletedView = treeView.findNode(node);

            let left = node.left;
            let right = node.right;
            node = null;
            if (right == null) {
                await this._balance(left);
                return left;
            }
            let min = this._findMin(right);
            min.right = this._deleteMin(right);
            min.left = left;
            await this._balance(min);
            return min;
        }
        return node;
    }
}

