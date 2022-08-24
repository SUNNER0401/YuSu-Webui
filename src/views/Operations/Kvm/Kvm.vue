<template>
  <b-container fluid>
    <page-title />
    <div class="terminal-container">
      <kvm-console :is-full-window="isFullWindow" />
    </div>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import KvmConsole from './KvmConsole';

export default {
  name: 'Kvm',
  components: { PageTitle, KvmConsole },
  provide() {
    return {
      setIsFullWindow: this.setIsFullWindow,
    };
  },
  data() {
    return {
      isFullWindow: false,
    };
  },
  methods: {
    setIsFullWindow(status) {
      this.isFullWindow = status;
    },
  },
};
</script>

<style scoped>
.terminal-container {
  max-width: 650.66px;
}
</style>
