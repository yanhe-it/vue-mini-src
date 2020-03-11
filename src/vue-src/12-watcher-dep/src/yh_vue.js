function yhVue(options) {
  this._data = options.data;
  let elm = document.querySelector(options.el);
  this._template = elm;
  this._parent = elm.parentNode;

  this.initData(); // 将 data 响应式化, 进行代理

  this.mount(); // 挂载 
}
