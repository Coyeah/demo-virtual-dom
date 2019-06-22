import _ from './utils';
import {
  REPLACE, REORDER, PROPS, TEXT
} from './patch';
import listDiff from 'list-diff2';

// 对比两棵树
const diff = (oldTree, newTree) => {
  let index = 0;    // 当前节点的标志
  let patches = {};   // 用于记录每个节点差异的对象
  difWalk(oldTree, newTree, index, patches);
  return patches;
}

// 对两棵树进行深度优先遍历
const difWalk = (oldNode, newNode, index, patches) => {
  let currentPatch = [];

  if (newNode === null) {   // 节点移除 | Node is removed
    // 实际DOM节点将在执行重新排序时被删除，因此不需要在这里做任何事情
    // Real DOM node will be removed when perform reordering, so has no needs to do anthings in here
  } else if (
    _.isString(oldNode) &&
    _.isString(newNode)
  ) {    // TextNode 情况 | TextNode content replacing
    if (newNode !== oldNode) {
      currentPatch.push({
        type: TEXT,
        content: newNode
      });
    }
  } else if (
    oldNode.tagName === newNode.tagName &&
    oldNode.key === newNode.key
  ) {   // 节点类型相同，判断节点属性和子节点是否变化 | Nodes are the same, diff old node's props and children
    // props
    let propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({
        type: PROPS,
        props: propsPatches
      });
    }
    // children
    if (!isIgnoreChildren(newNode)) {   // 如果节点包含 `ignore` 属性时，忽略比较子节点 | If the node has a `ignore` property, do not diff children
      diffChildren(
        oldNode.children,
        newNode.children,
        index,
        patches,
        currentPatch
      );
    }
  } else {    // 节点不一样，用新节点替换旧节点 | Nodes are not the same, replace the old node with new node
    currentPatch.push({type: REPLACE, node: newNode});
  }

  if (currentPatch.length) {
    patches[index] = currentPatch;
  }
} 

const diffChildren = (oldChildren, newChildren, index, patches, currentPatch) => {
  let {children, moves} = listDiff(oldChildren, newChildren, 'key');
  let newLength = newChildren.length;
  newChildren = children;

  if (moves.length) {
    let reorderPatch = {type: REORDER, moves, newLength};
    currentPatch.push(reorderPatch);
  }

  let leftNode = null,
    currentNodeIndex = index;
  _.each(oldChildren, function (child, i) {
    let newChild = newChildren[i];
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1;
    difWalk(child, newChild, currentNodeIndex, patches);
    leftNode = child;
  });
}

const diffProps = (oldNode, newNode) => {
  let key, value, 
    count = 0,
    oldProps = oldNode.props, 
    newProps = newNode.props,
    propsPatches = {};

  // 搜索已更改的属性 | Find out different properties
  for (key in oldProps) {
    value = oldProps[key];
    if (newProps[key] !== value) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  // 搜索新添加的属性 | Find out new property
  for (key in newProps) {
    value = newProps[key];
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  if (count === 0) {    // 所有属性均没变化 | If properties all are identical
    return null;
  }
  return propsPatches;
}

const isIgnoreChildren = node => (
  node.props && node.props.hasOwnProperty('ignore')
)

export default diff;