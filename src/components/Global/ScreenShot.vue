<template>
  <div class="icon-container">
    <b-icon class="h2 icon" :icon="'camera'" @click="jitT()" />
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'ScreenShot',
  mixins: [BVToastMixin],
  props: {
    element: {
      type: HTMLElement,
      default: null,
    },
  },
  methods: {
    async jitT() {
      var _this = this;
      let imgUrl = await new Promise((resolve) => {
        setTimeout(() => {
          html2canvas(_this.element, {
            useCORS: true,
            scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2,
            allowTaint: true,
          })
            .then((canvas) => {
              const imgData = canvas.toDataURL('image/png');
              resolve(imgData);
            })
            .catch(() => {
              _this.errorToast(_this.$t('global.toast.screenShotFailed'));
            });
        }, 300);
      });
      // Simulate the action that click a tag for downloading.
      var link = document.createElement('a');
      link.href = imgUrl;
      link.download = 'kvm-screenshot';
      link.click();
      link.remove();
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
