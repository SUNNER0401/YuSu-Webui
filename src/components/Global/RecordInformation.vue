<template>
  <b-icon
    class="h2 icon"
    :class="{ 'full-screen': isRecord }"
    :icon="!isRecord ? 'record-circle' : 'record-fill'"
    @click.stop="click"
  />
</template>

<script lang="ts">
export default {
  name: 'RecordInformation',
  props: {
    ws: {
      type: WebSocket,
      default: undefined,
    },
  },
  data() {
    return {
      isRecord: false,
      RecordingMessage: '',
      listenFunction: (event: { data: any }) => {
        const data = event.data;
        let view = new Uint8Array(data);
        for (let num of view) {
          this.RecordingMessage = this.RecordingMessage.concat(
            String.fromCharCode(num)
          );
        }
        this.RecordingMessage = this.RecordingMessage.concat('\n');
      },
    };
  },
  beforeDestroy() {
    if (this.isRecord) {
      this.ws.removeEventListener('message', this.listenFunction);
    }
  },
  methods: {
    click() {
      this.isRecord = !this.isRecord;
      this.sendRecordStatus();
      if (this.isRecord) {
        this.RecordingMessage = '';
        this.ws.addEventListener('message', this.listenFunction);
      } else {
        this.ws.removeEventListener('message', this.listenFunction);
        let link = document.createElement('a');
        [link.href, link.download] = [
          `data:text/json;charset=utf-8,${this.RecordingMessage}`,
          'SOL-Recording.txt',
        ];
        link.click();
      }
    },
    sendRecordStatus() {
      this.$emit('recordStatus', this.isRecord);
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
