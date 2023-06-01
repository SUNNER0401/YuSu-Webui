<template>
  <div>
    <b-icon
      v-if="!isRecording"
      class="h2 icon"
      icon="camera-reels"
      @click="record"
    />
    <b-icon
      v-else
      class="h2 icon"
      icon="camera-reels-fill"
      @click="stopRecord"
    />
    <div v-if="isRecording" id="record-block">
      <p>{{ $t('pageKvm.recording') }}: {{ recordingTime }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import RecordRTC from 'recordrtc';

export default {
  name: 'KvmRecorder',
  props: {
    element: {
      type: Element,
      default: null,
    },
  },
  data() {
    return {
      recorder: null,
      isRecording: false,
      recordingSeconds: 0,
      timer: null,
    };
  },
  computed: {
    recordingTime() {
      return this.secondsToHms(this.recordingSeconds);
    },
  },
  methods: {
    secondsToHms(seconds: number) {
      let hours: string | number = Math.floor(seconds / 3600);
      let minutes: string | number = Math.floor((seconds % 3600) / 60);
      let remainingSeconds: string | number = seconds % 60;
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      remainingSeconds =
        remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
      return `${hours}:${minutes}:${remainingSeconds}`;
    },
    async record() {
      this.timer = setInterval(() => {
        this.recordingSeconds++;
        console.log(this.recordingTime);
      }, 1000);
      let stream = this.element.captureStream();
      this.recorder = RecordRTC(stream, {
        type: 'video',
      });
      this.recorder.startRecording();
      this.isRecording = true;
    },
    stopRecord() {
      clearInterval(this.timer);
      this.recorder.stopRecording(() => {
        let blob = this.recorder.getBlob();
        let link = document.createElement('a');
        let URL = window.URL.createObjectURL(blob);
        let filename =
          'record-' +
          new Date()
            .toLocaleString()
            .replace(/\//g, '')
            .replace(/ /g, '')
            .replace(/:/g, '');
        [link.href, link.download] = [URL, filename];
        link.click();
        this.isRecording = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
svg {
  &:hover {
    cursor: pointer;
  }
}

#record-block {
  position: fixed;
  height: 20px;
  width: 40px;
  top: 0px;
  left: 0px;
  z-index: 1031;
}
</style>
