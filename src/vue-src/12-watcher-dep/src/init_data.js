let ARRAY_METHOD = [
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice"
];

// 思路：原型链 继承，修改原型链的 结构
// 继承关系： arr -> Array.prototype -> Object.prototype -> ...
// 改写后： arr -> 改写的方法 -> Array.prototype -> Object.prototype -> ...

let array_methods = Object.create(Array.prototype);

ARRAY_METHOD.forEach(method => {
  array_methods[method] = function() {
    // 调用原来的方法
    console.log("调用的是拦截的" + method);
    // 将数据 响应式化
    for (let i = 0; i < arguments.length; i++) {
      observe(arguments[i]);
    }

    let res = Array.prototype[method].apply(this, arguments);
    return res;
  };
});

/**
 * Vue 中的源码做了 判断
 * 如果浏览器支持 __proto__ 那么他就这么做
 * 如果不支持，Vue 使用的是 混入法
 */

// arr.length = 0 不支持
// 可以用 splice() 代替

function defineReactive(target, key, value, enumerable) {
  // 函数内部就是一个局部作用域，这个value就只在函数的使用的变量（闭包）
  if (typeof value === "object" && value != null) {
    observe(value);
  }

  let dep = new Dep();
  dep.__$protoName__ = key

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,

    get() {
      // console.log(`读取 ${key}`);
      /** 依赖收集(暂时忽略) */ 
      dep.depend();

      return value;
    },
    set(newValue) {
      // console.log(`设置 ${key} 为 ${newValue}`);

      if (value === newValue) return;

      // 将重新赋值的对象转换为响应式的，如果是对象，那么使用observe将其响应化
      if (typeof newValue === 'object' && newValue !== null) {
        value = observe(newValue);
      }
      value = newValue;

      /** 派发更新，找到全局的 watcher, 调用 update */
      dep.notify();
    }
  });
}

// 取代 reactify，将对象转换为响应式
// 将对象 obj 进行响应式, vm就是 vue 实例, 为了在调用时处理上下文
function observe(obj, vm) {
  // 之前没有对 obj 本身进行操作，这一次就直接对 obj 进行判断
  if (Array.isArray(obj)) {
    // 对其每一个元素　进行处理
    obj.__proto__ = array_methods;
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i], vm);
    }
  } else {
    // 对其成员　进行处理
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      let prop = keys[i];
      defineReactive.call(vm, obj, prop, obj[prop], true);
    }
  }
}

function proxy(target, prop, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return target[prop][key];
    },
    set(value) {
      target[prop][key] = value;
    }
  });
}

yhVue.prototype.initData = function() {
  // 遍历 this._data 的成员，将 属性 转换为 响应式 －＞ 代理到 实例上
  let keys = Object.keys(this._data);

  // 响应式化
  observe(this._data, this);

  // 代理
  for (let i = 0; i < keys.length; i++) {
    // 将 this._data[keys[i]] 映射到 this[keys[i]] 上
    proxy(this, "_data", keys[i]);
  }
};

