<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFanSpeed.description')" />
    <b-row class="main-row">
      <b-col sm="12" md="12">
        <page-section
          :section-title="$t('pageFanSpeed.currentStatus')"
          class="setting-section"
        >
          <b-row>
            <b-col sm="12" md="2">
              <div class="form-background current-status-background">
                <dl>
                  <dt>{{ $t('pageFanSpeed.status.currentmode') }}</dt>
                  <dd>
                    {{ dataFormatter(fanMode) }}
                  </dd>
                </dl>
              </div>
            </b-col>
            <b-col sm="12" md="10">
              <div class="current-status-background">
                <dl>
                  <dd>
                    <speed-chart :fan-speeds="fanSpeeds" />
                  </dd>
                </dl>
              </div>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageFanSpeed.autoControl')">
          <b-button
            variant="outline-primary"
            :disabled="!canBeClicked"
            @click="switch2NormalMode"
          >
            <img
              id="refresh-svg"
              src="@/env/assets/images/refresh.svg"
              :alt="altLogo"
            />
            {{ $t('pageFanSpeed.normalBalanceMode') }}
          </b-button>
        </page-section>
        <page-section :section-title="$t('pageFanSpeed.manualControl')">
          <b-form @submit.prevent="setFanMode(selected)">
            <div class="form-background pt-4">
              <b-row>
                <b-col sm="6" md="6">
                  <b-form-group :label="$t('pageFanSpeed.chooseMode')">
                    <dl>
                      <dd
                        v-for="(option, optionIndex) in options"
                        :key="optionIndex"
                      >
                        <b-form-radio
                          v-model="selected"
                          name="manual-control-radios"
                          :value="option"
                        >
                          {{
                            $t('pageFanSpeed.fanModes.' + option.toLowerCase())
                          }}
                        </b-form-radio>
                      </dd>
                      <br />
                      <dd>
                        <b-button
                          variant="primary"
                          type="submit"
                          data-test-id="Operation-button-saveFanSettings"
                          :disabled="!canBeClicked"
                        >
                          {{ $t('global.action.saveSettings') }}
                        </b-button>
                      </dd>
                    </dl>
                  </b-form-group>
                </b-col>
              </b-row>
            </div>
          </b-form>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import SpeedChart from './SpeedChart';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'FanSpeed',
  components: {
    SpeedChart,
    PageTitle,
    PageSection,
  },
  mixins: [LoadingBarMixin, BVToastMixin, DataFormatterMixin],
  data() {
    return {
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'Built on OpenBMC',
      options: ['MUTE', 'LOW', 'MEDIUM', 'HIGH', 'FULL'],
      selected: '',
      canBeClicked: true,
    };
  },
  computed: {
    ...mapGetters('fanSpeed', ['fanSpeeds', 'fanUrls', 'fanMode']),
  },
  created() {
    this.getFanSpeedData();
  },
  methods: {
    async setFanMode(mode) {
      this.canBeClicked = false;
      if (!mode) {
        await this.$bvModal
          .msgBoxOk(this.$t('pageFanSpeed.modal.errorSaveMessage'), {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
          })
          .finally(() => {
            this.canBeClicked = true;
          });
        return;
      }
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage') +
            ':' +
            this.$t('pageFanSpeed.fanModes.' + mode.toLowerCase()),
          {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirmed) => {
          if (confirmed) {
            await this.$store
              .dispatch('fanSpeed/setFanMode', mode)
              .then(() => {
                this.successToast(this.$t('pageFanSpeed.toast.successSwitch'));
              })
              .catch(() => {
                this.errorToast(this.$t('pageFanSpeed.toast.errorSwitch'));
              });
          }
        })
        .finally(() => {
          this.canBeClicked = true;
        });
    },
    async switch2NormalMode() {
      this.canBeClicked = false;
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage') +
            ':' +
            this.$t('pageFanSpeed.fanModes.default'),
          {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirmed) => {
          if (confirmed) {
            await this.$store
              .dispatch('fanSpeed/switch2NormalMode')
              .then(() => {
                this.successToast(this.$t('pageFanSpeed.toast.successSwitch'));
              })
              .catch(() => {
                this.errorToast(this.$t('pageFanSpeed.toast.errorSwitch'));
              });
          }
        })
        .finally(() => {
          this.canBeClicked = true;
        });
    },
    getFanSpeedData() {
      this.startLoader();
      this.$store.dispatch('fanSpeed/getFanSpeedData').finally(() => {
        this.endLoader();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-section {
  border-bottom: 1px solid gray('300');
}
#refresh-svg {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
.current-status-background {
  height: 90%;
  width: 100%;
}
.page-section {
  margin-bottom: $spacer * 1;
}
</style>
