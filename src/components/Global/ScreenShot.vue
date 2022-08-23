<template>
  <div class="icon-container">
    <svg-icon icon-class="screenshot" @click.stop="jitT()" />
  </div>
</template>

<script>
import ScreenShort from 'js-web-screen-shot';
export default {
  name: 'ScreenShot',
  methods: {
    jitT() {
      new ScreenShort({
        enableWebRtc: false, //是否显示选项框
        level: 99, //层级级别
        completeCallback: this.callback,
        closeCallback: this.closeFn,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.icon-container {
  height: 36px;
  width: 36px;

  .svg-icon {
    display: block;
    position: relative;
    top: 5px;
    height: 28px !important;
    width: 28px !important;
    margin: 0 auto;
  }

  &:hover {
    background-color: #cccccc;
    cursor: pointer;
  }
}
</style>
