const _ = {};

// ============ type ============ //

_.type = (obj) => (
  Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
)

// ============ isArray ============ //

_.isArray = (list) => (
  _.type(list) === 'Array'
);

// ============ isString ============ //

_.isString = (str) => (
  _.type(str) === 'String'
);

// ============ each ============ //

function arrayEach (array, iteratee) {
  let index = -1;
  const length = array.length;

  while(++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

_.each = function (collection, iteratee) {
  if (Array.isArray(collection)) {
    return arrayEach(collection, iteratee);
  }
  return null;
}

// ============ slice ============ //

_.slice = (arrayLike, index) => (
  Array.prototype.slice.call(arrayLike, index)
);

// ============ truthy ============ //

_.truthy = value => !!value;

// ============ toArray ============ //

_.toArray = listLike => {
  if (!listLike) return [];
  return [...listLike];
}

// ============ setAttr ============ //

_.setAttr = (node, key, value) => {
  switch (key) {
    case 'style':
      node.style.cssText = value;
      break;
    case 'value': 
      let tagName = node.tagName || '';
      tagName = tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        node.value = value;
      } else {
        node.setAttribute(key, value);
      }
      break;
    default:
      node.setAttribute(key, value);
      break;
  }
}

export default _;