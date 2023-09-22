<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <b-col>
              <dl>
                <dt>
                  {{ $t('pageRebootBmc.lastReboot') }}
                </dt>
                <dd v-if="lastBmcRebootTime">
                  {{ lastBmcRebootTime | formatDate }}
                  {{ lastBmcRebootTime | formatTime }}
                </dd>
                <dd v-else>--</dd>
              </dl>
            </b-col>
          </b-row>
          {{ $t('pageRebootBmc.rebootInformation') }}
          <b-button
            variant="primary"
            class="d-block mt-5"
            data-test-id="rebootBmc-button-reboot"
            @click="onClick"
          >
            {{ $t('pageRebootBmc.rebootBmc') }}
          </b-button>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  computed: {
    lastBmcRebootTime() {
      if ('Invalid Date' == this.$store.getters['controls/lastBmcRebootTime']) {
        return false;
      }
      return this.$store.getters['controls/lastBmcRebootTime'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('controls/getLastBmcRebootTime')
      .finally(() => this.endLoader());
  },
  methods: {
    onClick() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageRebootBmc.modal.confirmMessage'), {
          title: this.$t('pagePower..modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed: boolean) => {
          if (confirmed) this.rebootBmc();
        });
    },
    rebootBmc() {
      this.$store
        .dispatch('controls/rebootBmc')
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message));
    },
  },
};
</script>

<style lang="scss" scoped></style>
