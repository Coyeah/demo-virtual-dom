import _ from './utils';

function Element (tagName, props, children) {
  if (!(this instanceof Element)) {  // 非构造实例
    if (!_.isArray(children) && children != null) {
      children = _.slice(arguments, 2).filter(_.truthy);
    }
    return new Element(tagName, props, children);
  }

  if (_.isArray(props)) {   // no props
    children = props;
    props = {};
  }

  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  this.key = props
    ? props.key : void(0);
  
  let count = 0;    // 记录子节点数量，含子节点的子节点，即所有子节点

  _.each(this.children, function (child, i) {
    if (child instanceof Element) {
      count += child.count;
    } else {
      children[i] = '' + child;
    }
    count++;
  });

  this.count = count;
}

Element.prototype.render = function () {
  let el = document.createElement(this.tagName);
  let props = this.props;

  for (let propName in props) {
    let propValue = props[propName];
    _.setAttr(el, propName, propValue);
  }

  _.each(this.children, function (child) {
    let childEl = (child instanceof Element)
      ? child.render()
      : document.createTextNode(child);
    el.appendChild(childEl);
  });

  return el;
}

export default Element;