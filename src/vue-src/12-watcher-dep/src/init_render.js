yhVue.prototype.mount = function() {
  // 需要提供一个 render 方法, 生成 虚拟DOM
  this.render = this.createRender(); // 带有缓存（Vue本身是可以带有render成员）
  this.mountComponent();
};
yhVue.prototype.mountComponent = function() {
  // 执行mountComponent()函数
  let mount = () => {
    // 这里是一个函数，函数的this默认是全局对象 "函数调用模式"
    this.update(this.render());
  };

  // 这个 Watcher 就是全局的 Watcher，在任何一个位置都可以访问他了(简化的写法)
  new Watcher(this, mount);
};

// 这里是生成 render 函数， 目的是 缓存 AST （S使用虚拟DOM来模拟）
yhVue.prototype.createRender = function() {
  // debugger
  let ast = genVNode(this._template);
  // Vue: AST + data -> VNode
  return function render() {
    // 带槽VNode + data -> 含有数据的 VNode
    let _tmp = combine(ast, this._data);
    return _tmp;
  };
};

// 将 虚拟DOM 渲染到 页面中（diff算法）
yhVue.prototype.update = function(vnode) {
  // 简化
  let realDOM = parseVNode(vnode);
  // debugger
  // let _ = 0;
  this._parent.replaceChild(realDOM, document.querySelector("#root"));
};
