<template>
  <b-container fluid="xl">
    <page-title :description="$t('pagePageNotFound.description')" />
    <svg-icon icon-class="404" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
export default {
  name: 'PageNotFound',
  components: { PageTitle },
};
</script>
<style lang="scss" scoped>
.svg-icon {
  display: block;
  position: relative;
  height: 250px !important;
  width: 250px !important;
  margin: 0 auto;
}
</style>
