<template>
  <b-icon
    class="h2 icon"
    :icon="immersionMode ? 'cursor-fill' : 'cursor'"
    @click.stop="click"
  />
</template>

<script lang="ts">
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'ImmersionMode',
  mixins: [BVToastMixin],
  props: {
    area: {
      type: HTMLCanvasElement,
      default: null,
    },
  },
  data() {
    return {
      immersionMode: false,
    };
  },
  methods: {
    click(): void {
      if (!this.area) {
        this.errorToast(this.$t('global.toast.noArea'));
        return;
      }
      this.immersionMode = !this.immersionMode;
      if (this.immersionMode) {
        this.area.classList.add('immersionMode');
      } else {
        this.area.classList.remove('immersionMode');
      }
    },
  },
};
</script>
