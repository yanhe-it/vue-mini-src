/** watcher 观察者，用于发射更新的行为 */
let watcherID = 0;

class Watcher {
  /**
   *
   * @param {Object} vm yhVue 实例
   *
   * @param {String|Function} expOrfn
   * 如果是渲染watcher，传入的就是渲染函数；
   * 如果是计算watcher传入的就是路径表达式；
   * 暂时只考虑为函数的情况
   */
  constructor(vm, expOrfn) {
    this.vm = vm;
    this.getter = expOrfn;

    this.id = watcherID++;

    this.deps = []; // 依赖项
    this.depIDs = {}; //是一个 Set 类型，用于保证 依赖项的唯一性(简化的代码暂时不实现)

    // 一开始需要渲染：真实Vue中,this.lazy ? undefined : this.get()
    this.get();
  }

  /** 计算，触发getter */
  get() {
    pushTarget(this);

    this.getter.call(this.vm, this.vm); // 上下文的问题就解决了

    popTarget();
  }

  /**
   * 执行，并判断是 懒加载，还是同步执行，还是异步执行
   * 我们现在只考虑 异步执行（简化的是 同步执行）
   */
  run() {
    this.get();
    //在真正的vue中是调用 queueWatcher，来触发 nextTick 进行异步的执行
  }

  /** 对外公开的函数，用于在 属性发生变化时触发的借口 */
  update() {
    this.run();
  }

  /** 清空依赖队列 */
  cleanupDep() {}

  /** 将当前的 Dep 和 watcher 相关联 */
  addDep(dep) {
    this.deps.push(dep);
  }
}
