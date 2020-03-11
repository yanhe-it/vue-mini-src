/*
 * 使用  递归  来遍历 DOM 元素，生成  虚拟DOM
 * Vue  中的源码使用的是  栈结构，使用  栈  存储  父元素  来实现递归生成
 */
function genVNode(node) {
  let nodeType = node.nodeType;
  let _vnode = null;
  if (nodeType === 1) {
    // 元素
    let nodeName = node.nodeName;
    let attrs = node.attributes;
    let _attrObj = {};
    for (let i = 0; i < attrs.length; i++) {
      // attrs[i] 属性节点（nodeType == 2）
      _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
    }
    _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);

    // vnode 的  子元素
    let childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      _vnode.appendChild(genVNode(childNodes[i]));
    }
  } else if (nodeType === 3) {
    //文本
    _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
  }

  return _vnode;
}

function parseVNode(vnode) {
  let nodeType = vnode.type;
  let _node = null;
  if (nodeType === 1) {
    _node = document.createElement(vnode.tag);
    let data = vnode.data;
    // 遍历对象方法 1
    for (let key in data) {
      let attrName = key;
      let attrValue = data[key];
      _node.setAttribute(attrName, attrValue);
    }
    // // 遍历对象方法  2
    // Object.keys(data).forEach((key) => {
    //   let attrName = key;
    //   let attrValue = data[key]
    //   _node.createAttribute(attrName, attrValue)
    // })
    vnode.children.forEach(subvnode => {
      _node.appendChild(parseVNode(subvnode));
    });
  } else if (nodeType === 3) {
    return document.createTextNode(vnode.value);
  }
  return _node;
}

let regBrace = /\{\{(.+?)\}\}/g;
function createGetValueByPath(path) {
  let paths = path.split(".");

  return function getValueByPath(obj) {
    let res = obj;
    let prop = null;
    // shift函数  删除数组  第一个元素，  并  返回  第一个元素的值
    while ((prop = paths.shift())) {
      res = res[prop]; // obj.name 会转化为 obj["name"]
    }
    return res;
  };
}
/** 带槽 VNode + data 生成  带有数据的 VNode, 模拟 AST -> VNode */
function combine(vnode, data) {
  let _type = vnode.type;
  let _data = vnode.data;
  let _value = vnode.value;
  let _tag = vnode.tag;
  let _children = vnode.children;

  let _vnode = null;

  if (_type === 3) {
    // 文本节点
    _value = _value.replace(regBrace, function(_, g) {
      let path = g.trim(); //花括号中的东西     触发了get方法
      let getValueByPath = createGetValueByPath(path);
      return getValueByPath(data);
    });
    _vnode = new VNode(_tag, _data, _value, _type);
  } else if (_type === 1) {
    // 元素节点
    _vnode = new VNode(_tag, _data, _value, _type);
    _children.forEach(_subvnode => {
      _vnode.appendChild(combine(_subvnode, data));
    });
  }
  return _vnode;
}
