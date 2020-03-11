# vue 源码探索

## 1.数据驱动

* Vue与模板

  使用步骤：

  1. 编写页面模板
     1. 直接在`HTML`标签中写标签
     2. 使用`template`
     3. 使用单文件(`<template />`)
  2. 创建Vue实例
     1. 在Vue的构造函数中提供：data, methods, computed, watcher, props......
  3. 将Vue挂载到页面中(`mount`)

* 数据驱动模型

  Vue的执行流程：

  1. 获得模板：模板中有`槽`
  2. 利用Vue的构造函数中所提供的数据来`填槽`，得到可以在页面中显示的标签
  3. 将标签替换页面中原本有`槽`的标签

**Vue利用我们提供的`数据`和`模板`生成了一个新的`HTML`标签，替换了页面中放置模板的位置**

* 虚拟DOM

  目标：

  1. 怎么将真正的　DOM 转换为　虚拟DOM
  2. 怎么将　虚拟DON 转换为　真正的 DOM

  思路与深拷贝类似，遍历

## 2.函数柯里化与渲染模型

* 函数柯里化

  概念：一个函数原本有多个参数，只传入**一个**参数，生成一个新函数，由新函数接收剩下的参数来运行得到结果．

* 为什么使用柯里化？

  为了提升性能，使用柯里化可以缓存一部分数据．

* 两个案例

  1. 判断元素

     Vue本质上是使用`HTML`的字符串作为模板的，将字符串的模板转换为`AST`(抽象语法树)，再转换为`VNode`,最后再生成真实`DOM`.

     * 模板 -> AST
     * AST -> VNode
     * VNode -> DOM

     最消耗性能的是（模板 -> AST)

  2. 虚拟DOM的`render`方法

     在`03`中我们洗的代码，数据一旦改变，就会渲染，每次需要渲染的时候，模板就会被解析一次（因为是简化的）

     所以我们可以利用柯里化，将`虚拟DOM`缓存起来，生成一个函数，函数只需要传入数据，就可以得到真正的`DOM`.

## 3,响应式原理

* 我们在使用`Vue`时，赋值和获取属性都是直接使用的**Vue实例**
* 赋值之后，页面数据便会更新

实现方法：

```js
// 为对象定义属性
Object.defineProperty(Object, property, {
    writable,
    configable,
    enumerable, // 控制属性是否可枚举，是不是可以被 for-in 取出来
    set() {}, // 赋值触发
    get() {} // 取值触发
})
```

对于对象可以使用递归使其响应化，但是数组的某些方法我们也需要处理．

1. push
2. pop
3. shift
4. unshift
5. reverse
6. sort
7. splicef

要做什么事情呢？

1. 在改变数据的数据的时候，要发出通知．
   * Vue2 中的缺陷，数组发生变化，设置`length`没法通知（Vue3 中使用Proxy(ES6)语法解决
2. 加入的元素应该变成响应式的

**技巧**：如果一个函数已经定义了，但是我们需要扩展其功能，我们一般的处理方法：

1. 使用一个临时的函数名存储函数
2. 重新定义原来的函数
3. 定义扩展的功能
4. 调用临时的那个函数

扩展数组的`push`和`pop`怎么处理呢？

* 直接修改 prototype **不行**
* 修改要直接进行响应式化的数组的原型(\_\_proto\_\_)

## 4.发布订阅模式

* 目标: 解耦

* 在`Vue`中,整个的更新是按照组件为单位进行**判断** ,以节点为单位进行更新.

  * 如果代码中没有自定义组件,那么在比较算法的时候,我们会将**全部的模板**跟**虚拟DOM**进行比较.
  * 如果代码中含有自定义组件,那么在比较算法的手,就会判断更新的是哪一些组件中的属性,只会判断更新数据的组件,其他组件不会更新.

* 问题：

  1. 代理方法（app._data.name -> app.name）
  2. 时间模型（node: event模块）
  3. Vue中`Observer`与`Watcher`和`Dep`

* app._data已经是响应式的了，如果想把它变成跟`Vue`中直接app.name访问，就得需要代理

  ```js
  app.name 代理为　app._data.name
  ```

  所以引入一个函数**proxy(target, src, prop)**, 将target的操作映射到src.prop上

  Vue2 代码中没有`Proxy`语法(ES6)

* 我们之前处理的 reactify 方法已经不行了，我们需要一个新的方法来处理

* 提供一个`Observer`方法，在方法中对属性进行处理；可以将这个方法封装到`initData`方法中

```js
fuction proxy(app, prop, key) {
    Object.defineProperty(app, key, {
        get() {
            return app[prop][key];
        },
        set(value) {
            app[prop][key] = value;
        }
    })
}
```

* ​    发布订阅模式
  1. 中间的**全局的容器**, 用来存储可以被触发的东西(函数, 对象)
  2. 需要一个方法, 可以往容器中**传入**东西
  3. 需要一个方法,可以将容器中的东西取出来**使用**(函数调用, 对象的方法调用

## Watcher和Dep

### Wathcer

* 在Vue中, 页面都是多组件的, 第一次会由多个组件的Watcher存入到全局Watcher
  * 如果修改了局部的数据(例如其中一个组件的数据)
  * 表示只会对该组件进行`diff`算法, 也就是说只会重新生成该组件的AST
  * 只会访问该组件的 watcher
  * 也就是表示再次往全局存储的只有该组件的 Watcher
  * 页更新的时候也就只需要更新一部分
* Watcher 由一些方法
  * get() 用来进行**计算**或**执行**处理函数
  * update()　公共的外部方法，该方法会触发内部的 run 方法
  * run() 运行，用来判断内部是　异步运行还是同步运行等，这个方法最终会调用内部的 get 方法
  * cleanupDep() 简单理解为清除队列
* Watcher实例有一个属性`vm`,表示的就是当前的vue实例

### Dep

* 该对象提供**依赖收集(depend)**，**派发更新(notify)**的功能
* 在`notify`中调用`watcher`的`update`方法

## 依赖收集和派发更新

* 依赖收集：实际上就是告诉当前的 watcher 什么属性被访问了

  那个在这个 watcher 计算或渲染的时候，就会将这些收集到的属性进行更新

* 如何将属性和当前 watcher 关联起来？

  * 在全局准备一个 targetStack
  * 在 watcher 调用 get 方法的时候，将当前 watcher 放到全局，在 get 结束后，将这个全局的 watcher 移除；提供：pushTarget, popTarget
  * 在每一个属性中，都有一个 Dep 对象

* 我们在访问对象属性的时候（get)，我们的渲染watcher就在全局中．将属性与watcher关联，其实就是将当前渲染的 watcher 存储到相关的 dep 中．

  * 属性引用了当前的渲染watcher，**属性知道谁渲染它**
  * 当前渲染watcher引用了访问的属性(dep)，**当前的watcher知道渲染了什么属性**

* 我们的`dep`有一个方法，叫`notify()`

  内部就是将`dep`中的`subs`取出来，依次调用其`update`方法

  `subs`中存储的就是**知道要渲染什么属性的watcher**

## Vue源码

先看下Vue源代码src的目录

````js
src
	|-- compliler	
		/** 编译用的，Vue使用字符串作为模板
		* 存放着对模板字符串解析的算法，抽象语法树，优化等
        */
	|-- core
		// Vue构造函数，以及生命周期等方法的部分
	|-- platforms
		// 针对运行的环境（设备），有不同的实现
		// 也是vue的入口
	|-- server
		// 主要是vue在服务端的处理代码
	|-- sfc
		// single file component，　单文件组件
		// 一般是结合vue-cli使用
	|-- shared
		// 公共工具，方法
````

![Screenshot from 2020-03-10 14-13-24](/home/yanhe/Pictures/Screenshot from 2020-03-10 14-13-24.png)