let depID = 0;

class Dep {
  constructor() {
    this.id = depID++;
    this.subs = []; // 存储的是与当前 dep 关联的 watcher
  }

  /** 添加一个 watcher */
  addSub(sub) {
    this.subs.push(sub);
  }

  /** 移除一个 watcher */
  removeSub(sub) {
    for (let i = this.subs.length - 1; i >= 0; i--) {
      if (sub === this.subs[i]) {
        this.subs.splice(i, 1);
      }
    }
  }

  /** 将当前的 Dep 与当前的 watcher (暂时渲染 watcher) 关联 */
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target);

      Dep.target.addDep(this);
    }
  }

  /** 触发与之关联的 watcher 的 update 方法，起到更新的作用 */
  notify() {
    let deps = this.subs.slice();

    deps.forEach(watcher => {
      watcher.update();
    });
  }
}

/**
 * 全局的容器存储渲染 Watcher
 */
Dep.target = null;

let targetStack = [];

/** 将当前操作的 watcher 存储到全局watcher中，参数target及时当前watcher */
function pushTarget(target) {
  Dep.target = target;
  targetStack.unshift(Dep.target); // vue的源代码中使用的就是push
}

function popTarget() {
  targetStack.shift();
  Dep.target = targetStack;
}
