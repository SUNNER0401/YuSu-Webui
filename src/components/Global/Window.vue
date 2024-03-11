<template>
  <div
    ref="c__window"
    class="c__window"
    :class="{ is_active: isActive }"
    :style="windowStyle"
    @mousedown="handleWindowMouseDown"
  >
    <div
      class="title"
      @mousedown="handleDragStart($event)"
      @mouseup="handleDragEnd"
      @click="restoreWindow"
    >
      {{ title }}
    </div>
    <div v-show="!isMinimize" class="controls">
      <div class="controls--btn" @click="handleMinimize">
        <b-icon icon="dash"></b-icon>
      </div>
      <div class="controls--btn" @click="handleMaximize">
        <b-icon icon="stop"></b-icon>
      </div>
      <div class="controls--btn is_close" @click="handleClose">
        <b-icon icon="x"></b-icon>
      </div>
    </div>
    <div v-show="!isMinimize" class="content">
      <dynamic-chart
        :sensorsname="title"
        :type="type"
        :memberid="memberid"
        :units="units"
        :lowercaution="lowercaution"
        :uppercaution="uppercaution"
        :lowercritical="lowercritical"
        :uppercritical="uppercritical"
        :currentvalue="currentvalue"
        @send-chart-box="syncChartSize"
      />
    </div>
  </div>
</template>

<script>
import DynamicChart from '@/components/Global/DynamicChart';
export default {
  components: {
    DynamicChart,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    memberid: {
      type: String,
      required: true,
    },
    units: {
      type: String,
      required: true,
    },
    lowercaution: {
      required: true,
    },
    uppercaution: {
      required: true,
    },
    lowercritical: {
      required: true,
    },
    uppercritical: {
      required: true,
    },
    currentvalue: {
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isMinimize: {
      type: Boolean,
      default: false,
    },
    isMaximize: {
      type: Boolean,
      default: false,
    },
    miniWidth: {
      type: Number,
      default: 190,
    },
    miniLeft: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      height: 550,
      width: 1050,
      dragging: false,
      x: Math.random() * 50 + 50,
      y: Math.random() * 50 + 50,
      ox: 0,
      oy: 0,
      sx: 0,
      sy: 0,
    };
  },
  computed: {
    windowStyle() {
      if (this.isMaximize) {
        return {
          left: 0,
          right: 0,
          top: '60px',
          bottom: 0,
          borderRadius: '0',
          zIndex: 1003,
        };
      } else if (this.isMinimize) {
        return {
          left: this.miniLeft + `px`,
          bottom: 0,
          minWidth: this.miniWidth + `px`,
          minHeight: `40px`,
          width: this.miniWidth + `px`,
          height: `40px`,
          zIndex: this.isActive ? 1002 : 1001,
        };
      } else {
        return {
          left: `${this.x}px`,
          top: `${this.y}px`,
          width: `${this.width}px`,
          height: `${this.height}px`,
          zIndex: this.isActive ? 1002 : 1001,
        };
      }
    },
  },
  mounted() {
    const handleMouseMove = (event) => {
      if (this.dragging) {
        this.x = this.ox + event.clientX - this.sx;
        this.y = this.oy + event.clientY - this.sy;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('mousemove', handleMouseMove);
    });
  },
  methods: {
    handleDragStart(event) {
      this.sx = event.clientX;
      this.sy = event.clientY;
      this.ox = this.x;
      this.oy = this.y;
      this.dragging = true;
    },
    handleDragEnd() {
      this.dragging = false;
    },
    handleWindowMouseDown() {
      this.$emit('active');
    },
    handleClose() {
      this.$emit('close');
    },
    handleMinimize() {
      this.$emit('minimize');
    },
    handleMaximize() {
      this.$emit('maximize');
    },
    syncChartSize(echart) {
      var objResizeObserver = new ResizeObserver((entries) => {
        var entry = entries[0];
        var cr = entry.contentRect;
        if (echart) {
          echart.resize({
            width: cr.width * 0.9,
            height: cr.height * 0.95,
          });
        }
      });
      objResizeObserver.observe(this.$refs['c__window']);
    },
    restoreWindow() {
      if (this.isMinimize) {
        this.handleMinimize();
      }
    },
  },
};
</script>

<style scoped>
.c__window {
  min-width: 300px;
  min-height: 200px;
  display: grid;
  position: fixed;
  grid-template-areas: 'a b' 'c c';
  grid-template-rows: 40px 1fr;
  grid-template-columns: 1fr auto;
  border-radius: 8px;
  box-shadow: 2px 2px 6px #0003;
  background: linear-gradient(-10deg, #ccc, #fff);
  overflow: hidden;
  resize: both;
}
.c__window.is_active {
  background: linear-gradient(-10deg, #ccc 0%, #fff 80%, #ecf4ff 100%);
  box-shadow: 2px 2px 6px #0009;
  z-index: 1002;
}
.title {
  display: grid;
  grid-area: a;
  align-items: center;
  padding: 0 1em;
  color: #222;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.controls {
  display: grid;
  grid-area: b;
  grid-template-columns: repeat(3, 40px);
}
.controls--btn {
  display: grid;
  align-items: center;
  justify-items: center;
  transition: 0.2s;
  background: #fff0;
  cursor: pointer;
  user-select: none;
}
.controls--btn.is_close:hover {
  background: #f00;
}
.controls--btn:hover {
  background: #0002;
}
.controls--btn > img {
  width: 36%;
  height: 36%;
}
.content {
  position: relative;
  grid-area: c;
}
</style>
