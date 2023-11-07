<template>
  <b-icon
    class="h2 icon"
    :class="{ 'full-screen': isRecord }"
    :icon="!isRecord ? 'record-circle' : 'record-fill'"
    @click.stop="click"
  />
</template>

<script lang="ts">
import { Terminal } from 'xterm';

export default {
  name: 'RecordInformation',
  props: {
    term: {
      type: Terminal,
      default: undefined,
    },
  },
  data() {
    return {
      isRecord: false,
      recordMessageArray: [],
      timer: undefined,
      ondata: () => {},
    };
  },
  methods: {
    click() {
      this.term.selectAll();
      this.isRecord = !this.isRecord;
      this.sendRecordStatus();
      if (this.isRecord) {
        this.onData = this.term.onData((key: any) => {
          if (key === '\r' || key.charCodeAt() === 3) {
            this.term.selectAll();
            console.log(this.term.getSelection().trim() + '\r');
            this.recordMessageArray.push(
              this.term.getSelection().trim() + '\r'
            );
            this.term.reset();
          }
        });
        this.recordMessageArray = [];
        this.term.clear();
        this.timer = setInterval(() => {
          this.term.selectAll();
          this.recordMessageArray.push(this.term.getSelection().trim());
          this.term.reset();
        }, 10000);
      } else {
        clearInterval(this.timer);
        this.term.selectAll();
        this.recordMessageArray.push(this.term.getSelection().trim());
        this.term.reset();
        let blob = new Blob(this.recordMessageArray, {
          type: 'text/plain;charset=utf-8',
        });
        let link = document.createElement('a');
        [link.href, link.download] = [
          URL.createObjectURL(blob),
          'SOL-Recording.txt',
        ];
        link.click();
        this.onData.dispose();
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
