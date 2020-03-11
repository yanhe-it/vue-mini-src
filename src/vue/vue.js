new Vue({
  data: {
    msg: "hello"
  }
});

class Vue {
  constructor(options) {
    this.$options = options

    this.$data = options.data
    // 响应化
    this.observe(this.$data)
  }

  // 递归遍历，使传递进来的对象响应化
  observe(value) {
    if (!value || typeof value !== 'object') {
      return
    }

    // 遍历
    Object.keys(value).forEach(key => {
      // 对key做响应式处理
      this.defineReactive(value, key, value[key])
    })
  }

  defineReactive(obj, key, value) {

  }
}
