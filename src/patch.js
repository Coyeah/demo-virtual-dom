import _ from './utils';

export const REPLACE = 0;   // 新旧节点直接替换
export const REORDER = 1;   // 同级节点顺序变动
export const PROPS = 2;     // 节点属性修改
export const TEXT = 3;      // 文本节点修改

const patch = (node, patches) => {
  let walker = {index: 0};
  dfsWalk(node, walker, patches);
}

// 对节点进行深度优先遍历，更新修改
const dfsWalk = (node, walker, patches) => {
  let currentPatches = patches[walker.index];
  
  let len = node.childNodes
    ? node.childNodes.length
    : 0;
  for (let i = 0; i < len; i++) {
    let child = node.childNodes[i];
    walker.index++;
    dfsWalk(child, walker, patches);
  }

  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}

// 更新修改操作
const applyPatches = (node, currentPatches) => {
  _.each(currentPatches, function (currentPatch) {
    switch(currentPatch.type) {
      case REPLACE:
        let newNode = (typeof currentPatch === 'string')
          ? document.createTextNode(currentPatch.node)
          : currentPatch.node.render();
        node.parentNode.replaceChild(newNode, node);
        break;
      case REORDER:
        reorderChildren(node, currentPatch.moves);
        break;
      case PROPS:
        setProps(node, currentPatch.props);
        break;
      case TEXT:
        if (node.textContent) {
          node.textContent = currentPatch.content;
        } else {
          node.nodeValue = currentPatch.content
        }
        break;
      default:
        throw new Error(`Unknown patch type ${currentPatch.type}`);
    }
  });
}

// 处理 同级节点顺序变动 情况
const reorderChildren = (node, moves) => {
  let staticNodeList = _.toArray(node.childNodes),
    maps = {};
  
  _.each(staticNodeList, function (node) {
    if (node.nodeType === 1) {    // 如果节点是元素节点 -> 1 ; 如果节点是属性节点 -> 2
      let key = node.getAttribute('key');
      if (key) {
        maps[key] = node;
      }
    }
  });

  _.each(moves, function (move) {
    let index = move.index;
    if (move.type === 0) {    // remove item
      if (staticNodeList[index] === node.childNodes[index]) {   // 可能因为插入而被删除了 | maybe have been removed for inserting
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1);
    } else if (move.type === 1) {   // insert item
      let insertNode = maps[move.item.key]
        ? maps[move.item.key].cloneNode(true)
        : (typeof move.item === 'object')
          ? move.item.render()
          : document.createTextNode(move.item);
      staticNodeList.splice(index, 0, insertNode);
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  });
}

// 处理 节点属性修改 情况
const setProps = (node, props) => {
  for (let key in props) {
    if (props[key] === void(0)) {
      node.removeAttribute(key);
    } else {
      let value = props[key];
      _.setAttr(node, key, value);
    }
  }
}

export default patch;