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

<script lang="ts">
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import screenfull, { Screenfull } from 'screenfull';

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
      if (!(screenfull as Screenfull).enabled) {
        this.warningToast(this.$t('global.toast.browserNotSupport'), {
          title: this.$t('global.toast.warning'),
        });
        return false;
      }
      (screenfull as Screenfull).on('error', (event) => {
        console.error('Failed to enable fullscreen', event);
      });
      if (!(screenfull as Screenfull).isFullscreen) {
        if (this.element) {
          (screenfull as Screenfull).request(this.element);
        } else {
          (screenfull as Screenfull).request();
        }
      } else {
        (screenfull as Screenfull).exit();
        if (!this.isFullscreen) {
          if (this.element) {
            setTimeout(() => {
              (screenfull as Screenfull).request(this.element);
            }, 50);
          } else {
            setTimeout(() => {
              (screenfull as Screenfull).request();
            }, 50);
          }
        }
      }
    },
    change() {
      if ((screenfull as Screenfull).isFullscreen) {
        if (
          this.element == (screenfull as Screenfull).element ||
          (!this.element &&
            (screenfull as Screenfull).element!.tagName == 'HTML')
        ) {
          if (this.setIsFullWindow) {
            this.setIsFullWindow(true);
          }
          this.isFullscreen = (screenfull as Screenfull).isFullscreen;
        } else {
          return;
        }
      } else {
        if (this.setIsFullWindow) {
          this.setIsFullWindow(false);
        }
        this.isFullscreen = (screenfull as Screenfull).isFullscreen;
      }
    },
    init() {
      if ((screenfull as Screenfull).enabled) {
        (screenfull as Screenfull).on('change', this.change);
      }
    },
    destroy() {
      if ((screenfull as Screenfull).enabled) {
        (screenfull as Screenfull).off('change', this.change);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.svg-icon {
  height: 18px !important;
  width: 18px !important;
}
svg {
  &:hover {
    background-color: #cccccc;
    cursor: pointer;
  }
}
</style>
