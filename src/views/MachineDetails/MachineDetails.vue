<template>
  <page-title />
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
export default {
  name: 'MachinedDetails',
  components: {
    PageTitle,
  },
  mixins: [LoadingBarMixin],
};
</script>
