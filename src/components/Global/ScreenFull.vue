<template>
  <b-icon
    v-if="element"
    class="h2 icon"
    :class="{ 'full-screen': isFullscreen }"
    :icon="!isFullscreen ? 'tv' : 'tv-fill'"
    @click.stop="click"
  />
  <svg-icon
    v-else
    :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
    @click.stop="click"
  />
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import screenfull from 'screenfull';

export default {
  name: 'ScreenFull',
  mixins: [BVToastMixin],
  inject: {
    setIsFullWindow: {
      default: null,
    },
  },
  props: {
    element: {
      type: HTMLDivElement,
      default: null,
    },
  },
  data() {
    return {
      isFullscreen: false,
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.destroy();
  },
  methods: {
    click() {
      if (!screenfull.enabled) {
        this.warningToast(this.$t('global.toast.browserNotSupport'), {
          title: this.$t('global.toast.warning'),
        });
        return false;
      }
      screenfull.on('error', (event) => {
        console.error('Failed to enable fullscreen', event);
      });
      if (!screenfull.isFullscreen) {
        if (this.element) {
          screenfull.request(this.element);
        } else {
          screenfull.request();
        }
      } else {
        screenfull.exit();
        if (!this.isFullscreen) {
          if (this.element) {
            setTimeout(() => {
              screenfull.request(this.element);
            }, 50);
          } else {
            setTimeout(() => {
              screenfull.request();
            }, 50);
          }
        }
      }
    },
    change() {
      if (screenfull.isFullscreen) {
        if (
          this.element == screenfull.element ||
          (!this.element && screenfull.element.tagName == 'HTML')
        ) {
          if (this.setIsFullWindow) {
            this.setIsFullWindow(true);
          }
          this.isFullscreen = screenfull.isFullscreen;
        } else {
          return;
        }
      } else {
        if (this.setIsFullWindow) {
          this.setIsFullWindow(false);
        }
        this.isFullscreen = screenfull.isFullscreen;
      }
    },
    init() {
      if (screenfull.enabled) {
        screenfull.on('change', this.change);
      }
    },
    destroy() {
      if (screenfull.enabled) {
        screenfull.off('change', this.change);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  &:hover {
    background-color: #cccccc;
    cursor: pointer;
  }
}
.svg-icon {
  height: 18px !important;
  width: 18px !important;
}
</style>
