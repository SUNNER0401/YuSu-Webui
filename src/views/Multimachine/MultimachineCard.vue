<template>
  <b-card bg-variant="light" border-variant="light" class="mb-4">
    <div class="justify-content-between align-items-center d-flex flex-wrap">
      <h3 class="h5 mb-0">{{ title }}</h3>
      <b-link :to="to">{{ $t('pageMultimachine.viewMore') }}</b-link>
    </div>
    <b-row class="mt-3">
      <!-- 左边一列 -->
      <b-col sm="6">
        <!--写死版 不需要可直接注释以下dl-->
        <dl>
          <dt>{{ $t('pageMultimachine.model') }}</dt>
          <dd>{{ dataFormatter(model) }}</dd>
          <dt>{{ $t('pageMultimachine.serialNumber') }}</dt>
          <dd>{{ dataFormatter(serialNumber) }}</dd>
          <dt>{{ $t('pageMultimachine.ipAddress') }}</dt>
          <dd>{{ dataFormatter(ipAddress) }}</dd>
          <dt>{{ $t('pageMultimachine.health') }}</dt>
          <dd>{{ dataFormatter(health) }}</dd>
        </dl>
        <!-- 数据存放在data中 动态产生 -->
        <!-- <dl v-for="(value, key) in data" :key="key">
          <dt>{{ key }}</dt>
          <dd>{{ value }}</dd>
        </dl> -->
      </b-col>
      <b-col sm="6">
        <!--写死版 不需要可直接注释以下dl-->
        <dl>
          <dt>{{ $t('pageMultimachine.hostname') }}</dt>
          <dd>{{ dataFormatter(hostname) }}</dd>
          <dt>{{ $t('pageMultimachine.linkStatus') }}</dt>
          <dd>{{ dataFormatter(linkStatus) }}</dd>
          <dt>
            <b-badge variant="warning">{{
              $t('pageMultimachine.warning')
            }}</b-badge>
          </dt>
          <dd>{{ dataFormatter(warning) }}</dd>
          <dt>
            <b-badge variant="danger">{{
              $t('pageMultimachine.error')
            }}</b-badge>
          </dt>
          <dd>{{ dataFormatter(error) }}</dd>
        </dl>
        <!-- 数据存放在data中 动态产生 -->
        <!-- <dl v-for="(value, key) in data" :key="key">
          <dt>{{ key }}</dt>
          <dd>{{ value }}</dd>
        </dl> -->
      </b-col>
    </b-row>
  </b-card>
</template>
<script>
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
export default {
  name: 'MultimachineCard',
  mixins: [DataFormatterMixin],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: 'Machinetest01',
    },
  },
};
</script>
<style lang="scss" scoped>
a {
  vertical-align: middle;
  font-size: 14px;
}

.card {
  min-width: 300px;
  max-width: 330px;
  margin-right: 20px;
  // margin-left: 10px;
}
</style>
