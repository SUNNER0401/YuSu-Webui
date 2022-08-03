<template>
  <b-container fluid>
    <page-title />
    <div class="terminal-container">
      <kvm-console :is-full-window="false" />
    </div>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import KvmConsole from './KvmConsole';

export default {
  name: 'Kvm',
  components: { PageTitle, KvmConsole },
};
</script>

<style scoped>
.terminal-container {
  max-width: 650.66px;
}
</style>
