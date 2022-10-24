<template>
  <b-container fluid>
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
                              <b-col cols="3">
                                <p>{{ fanName }}</p>
                              </b-col>
                              <b-col cols="3">
                                <b-form-input
                                  v-model="pwmValues[pwmRelation[fanName]]"
                                  class="text-center"
                                  type="number"
                                  min="0"
                                  max="100"
                                  :state="
                                    getValidationState(
                                      $v.pwmValues[pwmRelation[fanName]]
                                    )
                                  "
                                  @blur="
                                    $v.pwmValues[pwmRelation[fanName]].$touch()
                                  "
                                  @focus="
                                    $v.pwmValues[pwmRelation[fanName]].$reset()
                                  "
                                />
                                <b-form-invalid-feedback role="alert">
                                  <div
                                    v-if="
                                      !$v.pwmValues[pwmRelation[fanName]]
                                        .required
                                    "
                                  >
                                    {{ $t('global.form.fieldRequired') }}
                                  </div>
                                  <div
                                    v-else-if="
                                      !$v.pwmValues[pwmRelation[fanName]]
                                        .between
                                    "
                                  >
                                    {{
                                      $t('global.form.valueMustBeBetween', {
                                        min: 0,
                                        max: 100,
                                      })
                                    }}
                                  </div>
                                </b-form-invalid-feedback>
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

<script lang="ts">
import FanSpeedChart from './FanSpeedChart';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { mapGetters } from 'vuex';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { required, between } from 'vuelidate/lib/validators';

export default {
  name: 'FanSpeed',
  components: {
    FanSpeedChart,
    PageTitle,
    PageSection,
  },
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin],
  // @ts-ignore
  validations() {
    return {
      pwmValues: {
        PWM1: {
          required,
          between: between(0, 100),
        },
        PWM2: {
          required,
          between: between(0, 100),
        },
        PWM3: {
          required,
          between: between(0, 100),
        },
        PWM4: {
          required,
          between: between(0, 100),
        },
        PWM5: {
          required,
          between: between(0, 100),
        },
        PWM6: {
          required,
          between: between(0, 100),
        },
      },
    };
  },
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
  created(): void {
    this.startLoader();
    this.$store.dispatch('fanSpeed/getFanAllData').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    submitSetting(zoneName: string): void {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.startLoader();
      let mode: string = this.fanModes[zoneName];
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageFanSpeed.modal.confirmMessage', { zoneName }),
          {
            title: this.$t('pageFanSpeed.modal.confirmTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirm: boolean) => {
          // Set zone mode.
          if (confirm) {
            await this.$store
              .dispatch('fanSpeed/setFanMode', { zoneName, mode })
              .then(async () => {
                // Set PWM of each fans.
                let iferr = false;
                if (mode == 'MANUAL_MODE') {
                  let promises: string[] = [];
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
.speed-confirm {
  height: 32px;
}
::v-deep .form-control {
  height: 26px;
}
</style>
