<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <page-title
          class="mb-4"
          :description="$t('pageSerialOverLan.subTitle')"
        />

        <page-section class="mb-0">
          <serial-over-lan-console
            ref="serial-over-lan-console"
            :is-full-window="isFullWindow"
            :element="element"
          />
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import SerialOverLanConsole from './SerialOverLanConsole';

export default {
  name: 'SerialOverLan',
  components: {
    PageSection,
    PageTitle,
    SerialOverLanConsole,
  },
  provide() {
    return {
      setIsFullWindow: this.setIsFullWindow,
    };
  },
  beforeRouteLeave(to: any, from: any, next: any) {
    if (this.$refs['serial-over-lan-console'].isRecord) {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageSerialOverLan.modal.beforeLeaveRoute'), {
          title: this.$t('global.status.warning'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirm: boolean) => {
          if (confirm) {
            if (
              this.$refs['serial-over-lan-console'].$refs['record-information']
                .timer
            ) {
              clearInterval(
                this.$refs['serial-over-lan-console'].$refs[
                  'record-information'
                ].timer
              );
            }
            next();
          }
        });
    } else {
      next();
    }
  },
  // You only can get dom after mounting operation.
  data() {
    return {
      element: null,
      isFullWindow: false,
    };
  },
  mounted() {
    this.element = document.getElementById('base-container');
  },
  methods: {
    setIsFullWindow(status: any) {
      this.isFullWindow = status;
    },
  },
};
</script>

<style lang="scss" scoped>
.container-fluid {
  height: 90vh;
}
</style>
