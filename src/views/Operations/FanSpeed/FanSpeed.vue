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
            <b-col sm="12" md="12">
              <div class="current-status-background">
                <dl>
                  <dd>
                    <fan-speed-chart :fan-speeds="fanSpeeds" />
                  </dd>
                </dl>
              </div>
            </b-col>
          </b-row>
        </page-section>
        <page-section :section-title="$t('pageFanSpeed.zoneControl')">
          <b-form @submit.prevent="setFanMode(selected)">
            <div class="form-background pt-4">
              <b-row>
                <b-col sm="6" md="6">
                  <template v-for="(fanNameList, zoneName, index1) in zones">
                    <b-form
                      :key="index1"
                      class="ml-4 mb-4"
                      @submit="submitSetting(zoneName)"
                    >
                      <b-row>
                        <b-col>
                          <b-row>
                            <b-col>
                              <h4>{{ zoneName }}</h4>
                              <b-row>
                                <b-col xl="5">
                                  <b-form-select
                                    v-model="fanModes[zoneName]"
                                    :options="allModes"
                                    size="sm"
                                    class="mb-3"
                                  >
                                  </b-form-select>
                                </b-col>
                              </b-row>
                            </b-col>
                          </b-row>
                          <!-- These functions only can be used in manual mode. -->
                          <template v-if="fanModes[zoneName] === 'MANUAL_MODE'">
                            <b-row
                              v-for="(fanName, index2) in fanNameList"
                              :key="index2"
                            >
                              <b-col xl="3">
                                <p>{{ fanName }}</p>
                              </b-col>
                              <b-col>
                                <b-form-spinbutton
                                  v-model="pwmValues[pwmRelation[fanName]]"
                                  min="1"
                                  max="100"
                                  placeholder="--"
                                  wrap
                                >
                                </b-form-spinbutton>
                              </b-col>
                            </b-row>
                          </template>
                          <b-row>
                            <b-col>
                              <b-button
                                class="speed-confirm"
                                variant="primary"
                                type="submit"
                                >{{ $t('global.action.save') }}
                              </b-button>
                            </b-col>
                          </b-row>
                        </b-col>
                      </b-row>
                    </b-form>
                  </template>
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
import FanSpeedChart from './FanSpeedChart';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'FanSpeed',
  components: {
    FanSpeedChart,
    PageTitle,
    PageSection,
  },
  mixins: [LoadingBarMixin, BVToastMixin],
  computed: {
    ...mapGetters('fanSpeed', [
      'fanSpeeds',
      'fanUrls',
      'fanModes',
      'zones',
      'pwmRelation',
      'pwmValues',
      'allModes',
    ]),
  },
  created() {
    this.startLoader();
    this.$store.dispatch('fanSpeed/getFanAllData').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    submitSetting(zoneName) {
      this.startLoader();
      let mode = this.fanModes[zoneName];
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage', { zoneName }),
          {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirm) => {
          // Set zone mode.
          if (confirm) {
            await this.$store
              .dispatch('fanSpeed/setFanMode', { zoneName, mode })
              .then(async () => {
                // Set PWM of each fans.
                let iferr = false;
                if (mode == 'MANUAL_MODE') {
                  let promises = [];
                  const fanList = [...this.zones[zoneName]];
                  fanList.forEach((fanName) => {
                    let pwmName = this.pwmRelation[fanName];
                    let value = this.pwmValues[pwmName];
                    let promise = this.$store
                      .dispatch('fanSpeed/setPwmValue', { pwmName, value })
                      .catch(() => {
                        iferr = true;
                      });
                    promises.push(promise);
                  });
                  await Promise.all(promises);
                  if (iferr) {
                    throw new Error();
                  }
                }
              })
              .then(async () => {
                await this.successToast(
                  this.$t('pageFanSpeed.toast.successSaving')
                );
              })
              .catch(async () => {
                // If you set failed, the modes and speed values will be updated.
                await this.errorToast(
                  this.$t('pageFanSpeed.toast.errorSetting')
                );
                await this.$store.dispatch('fanSpeed/getFanAllData');
              });
          }
        })
        .finally(() => {
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
.current-status-background {
  height: 90%;
  width: 100%;
}
.page-section {
  margin-bottom: $spacer * 1;
}
.b-form-spinbutton {
  width: 150px;
  height: 24px;
}
.speed-confirm {
  height: 32px;
}
</style>
