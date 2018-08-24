import { EventEmitter } from 'fbemitter';

export type TreeDataFilter<T> = (d: T) => boolean;

export type TreeArrayElement<T> = T | string;

export type BaseHandlerCollection = {
  [key: string]: (...args) => void
}

/**
 *  Tree a tree struct to handle data
 *  extends from EventEmitter to make broadcast and emit method
 *
 *  every node is tree and every tree is node
 *  tree has no limit node
 *  the node without parent is root
 *  the node without children is really node
 *
 *  @param parent [the parent of this tree node]
 */
export default class Tree<T> extends EventEmitter {

  static BROADCAST_CHANGE_ROOT: string = 'BROADCAST_CHANGE_ROOT';

  parent?: Tree<T>;
  data: T;
  nodes: Tree<T>[];
  root?: Tree<T>;

  constructor(data: T) {
    super();
    this.data = data;
    this.nodes = [];
  }

  // broadcast event from up to down
  $broadcast(event: string, ...args): void {
    this.nodes.forEach(node => {
      node.emit(event, ...args);
      node.$broadcast(event, ...args);
    })
  }

  // pop up event from down to up
  $emit(event: string, ...args): void {
    if (this.parent) {
      this.parent.emit(event, ...args);
      this.parent.$emit(event, ...args);
    }
  }

  $updateRoot(root?: Tree<T>): Tree<T> {
    this.root = root;
    this.nodes.forEach(node => {
      node.$updateRoot(this.root || this);
    })
    return this;
  }

  static fromArray<T>(array: TreeArrayElement<T>[]) {
    const length = array.length;
    const less = [] as { nodeLength: number, data: T }[];
    for (let i = 0; i < length / 2; i += 1) {
      const data = array[i * 2] as T
      const nodeSplit = array[i * 2 + 1] as string;
      const nodeLength = Number(nodeSplit.replace(/@(\d+)@/, '$1'))
      less.push({
        nodeLength, data
      });
    }
    function createTree() {
      const cur = less.shift();
      const t = new Tree(cur && cur.data);
      if (cur && cur.nodeLength > 0) {
        for (let i = 0; i < cur.nodeLength; i += 1) {
          const node = createTree();
          t.addNode(node);
        }
      }
      return t;
    }
    const root = createTree();
    return root;
  }

  delNode(t: Tree<T>): Tree<T> {
    const index = this.nodes.indexOf(t);
    this.nodes.splice(index, 1);
    t.$updateRoot()
    return this;
  }

  addNode(t: Tree<T>): Tree<T> {
    this.nodes.push(t);
    t.parent = this;
    t.$updateRoot(this.root || this);
    return this;
  }

  toArray(): TreeArrayElement<T>[]  {
    return this.nodes.reduce((pre, cur) => pre.concat(cur.toArray()), [this.data, `@${this.nodes.length}@`]);
  }


  findAll(filter: TreeDataFilter<T>): T[] {
    return this.nodes.reduce((pre, cur) => {
      return pre.concat(cur.findAll(filter));
    }, [this.data])
  }

  findOne(filter: TreeDataFilter<T>): T | undefined {
    if (filter(this.data)) {
      return this.data;
    }
    if (this.nodes.length > 0) {
      let data;
      for (let i = 0; i < this.nodes.length; i += 1) {
        data = this.nodes[i].findOne(filter);
        if (data) {
          break;
        }
      }
      return data;
    } else {
      return;
    }
  }
}
