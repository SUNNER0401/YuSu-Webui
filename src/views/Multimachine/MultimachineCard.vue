<template>
  <b-card bg-variant="light" border-variant="light" class="mb-4">
    <!-- 标题 -->
    <div class="justify-content-between align-items-center d-flex flex-wrap">
      <!-- 卡片标题 -->
      <h3 class="h5 mb-0">路由001</h3>
      <!-- 查看更多按钮 -->
      <b-link :to="to">{{ $t('pageMultimachine.viewMore') }}</b-link>
    </div>
    <!-- 内容 -->
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <!-- 型号 -->
          <dt>{{ $t('pageMultimachine.model') }}</dt>
          <dd>{{ dataFormatter(model) }}</dd>
          <!-- 序列号 -->
          <dt>{{ $t('pageMultimachine.serialNumber') }}</dt>
          <dd>{{ dataFormatter(serialNumber) }}</dd>
          <!-- ip -->
          <dt>{{ $t('pageMultimachine.ipAddress') }}</dt>
          <dd>{{ dataFormatter(ipAddress) }}</dd>
          <!-- 健康状态 -->
          <dt>{{ $t('pageMultimachine.health') }}</dt>
          <dd>{{ dataFormatter(health) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </b-card>
</template>
<script>
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
export default {
  name: 'MultimachineCard',
  mixins: [DataFormatterMixin],
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
  margin-left: 10px;
}
</style>
