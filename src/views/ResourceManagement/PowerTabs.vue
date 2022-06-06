<template>
  <div>
    <b-card no-body>
      <b-tabs card>
        <b-tab :title="$t('pagePower.tabs.tab1.name')" active>
          <b-row>
            <b-col v-if="!tab1.powerInformations">
              {{ $t('pagePower.tabs.tab1.powerInfo.empty') }}
            </b-col>
            <b-col
              v-for="(value1, key1, index1) in tab1.powerInformations"
              v-else
              :key="index1"
            >
              <b-card class="power-supply-card" no-body>
                <b-card-body>
                  <b-row>
                    <b-col>
                      <h4 class="mb-0 d-inline">
                        {{ $t('pagePower.tabs.tab1.power') + `${index1 + 1}` }}
                      </h4>
                      <div style="float: right">
                        <h4 class="mb-0 power-number d-inline">
                          {{ tab1.powerNumber }}
                        </h4>
                        <sup class="mb-0 unit">{{ tab1.unit }}</sup>
                      </div>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <h4 style="float: right">
                        {{ $t('pagePower.tabs.tab1.status') }}
                      </h4>
                    </b-col>
                  </b-row>
                  <hr />
                  <b-card-text
                    v-for="(value2, key2, index2) in value1.fieldName"
                    :key="index2"
                  >
                    <b-row>
                      <b-col>{{ value2 }}</b-col>
                      <b-col>
                        {{ value1.value[key2] }}
                      </b-col>
                    </b-row>
                  </b-card-text>
                </b-card-body>
              </b-card>
            </b-col>
          </b-row>
        </b-tab>
        <b-tab :title="$t('pagePower.tabs.tab2.name')">
          <b-card class="power-cap" no-body>
            <b-card-body>
              <b-row>
                <b-col xl="4">
                  <b-row>
                    <b-col>
                      <b-card-title>{{
                        $t('pagePower.tabs.tab2.powerStatus')
                      }}</b-card-title>
                    </b-col>
                    <b-col class="pl-0">
                      <div>
                        <b-button-group>
                          <b-button
                            :pressed="toggle1"
                            variant="primary"
                            @click="swap"
                          >
                            W
                          </b-button>
                          <b-button
                            :pressed="toggle2"
                            variant="primary"
                            @click="swap"
                          >
                            BTU/h
                          </b-button>
                        </b-button-group>
                      </div>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col>
                  <b-row>
                    <b-col xl="7">
                      <div>
                        {{ $t('pagePower.tabs.tab2.statisticStart') }}：
                        {{ startTime | formatDate }}
                        {{ startTime | formatTime }}
                      </div>
                    </b-col>
                    <b-col xl="4" class="reset-button">
                      <b-button variant="primary" @click="resetCalculate()">
                        <img
                          src="@/env/assets/images/refresh.svg"
                          :alt="altLogo"
                        />
                        {{ $t('pagePower.tabs.tab2.reset') }}
                      </b-button>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-body>
              <b-list-group flush>
                <b-row>
                  <template
                    v-for="(value, key, index) in tab2.powerCapInformation
                      .fieldName"
                  >
                    <b-col :key="index" xl="6">
                      <b-list-group-item>
                        <b-row>
                          <b-col xl="6" class="power-cap-value-field">
                            {{ value }}
                          </b-col>
                          <b-col xl="4" class="power-cap-unit">
                            <span v-if="tab2.unit === 'W'">
                              {{ tab2.powerCapInformation.value[key] }}
                            </span>
                            <span v-if="tab2.unit === 'BTU/h'">
                              {{
                                (
                                  tab2.powerCapInformation.value[key] * multiple
                                ).toFixed(1)
                              }}
                            </span>
                            <sup>{{ tab2.unit }}</sup>
                          </b-col>
                        </b-row>
                      </b-list-group-item>
                    </b-col>
                  </template>
                  <b-col xl="6">
                    <b-list-group-item>
                      <b-row>
                        <b-col xl="6">
                          {{ tab2.totalConsumedPower.fieldName }}
                        </b-col>
                        <b-col xl="4">
                          <span v-if="tab2.unit === 'W'">
                            {{
                              (
                                tab2.totalConsumedPower.value /
                                1000 /
                                3600
                              ).toFixed(1)
                            }}
                          </span>
                          <span v-if="tab2.unit === 'BTU/h'">
                            {{
                              (
                                (tab2.totalConsumedPower.value * multiple) /
                                3600
                              ).toFixed(1)
                            }}
                          </span>
                          <sup>{{ tab2.totalConsumedPower.unit }}</sup>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                  </b-col>
                </b-row>
              </b-list-group>
            </b-card-body>
          </b-card>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'PowerTabs',
  props: {
    powerConsumptionValue: {
      required: true,
      type: Number,
    },
  },
  data() {
    return {
      currentPeakPower: 0,
      altLogo: process.env.VUE_APP_COMPANY_NAME,
      multiple: 3.412,
      toggle1: true,
      toggle2: false,
      tab2Unit: true,
    };
  },
  computed: {
    startTime() {
      return this.$store.getters['powerControl/startCalculateTime'];
    },
    isTab2Unitw: {
      get() {
        return this.tab2Unit;
      },
      set(value) {
        this.tab2Unit = value;
        this.toggle1 = !this.toggle1;
        this.toggle2 = !this.toggle2;
      },
    },
    powerSupplies() {
      return this.$store.getters['powerSupply/powerSupplies'];
    },
    powerInformations() {
      const powerInformations = {};
      this.powerSupplies.forEach((item, index) => {
        powerInformations[`power${index}`] = {
          fieldName: {
            name: this.$t('pagePower.tabs.tab1.powerInfo.name'),
            manufacturer: this.$t('pagePower.tabs.tab1.powerInfo.manufacturer'),
            statusState: this.$t('pagePower.tabs.tab1.powerInfo.statusState'),
          },
          value: {
            name: item.name,
            manufacturer: item.manufacturer,
            statusState: item.statusState,
          },
        };
      });
      return powerInformations;
    },
    tab1() {
      return {
        powerNumber: 120,
        unit: 'W',
        powerInformations: this.powerInformations,
      };
    },
    tab2() {
      return {
        unit: this.tab2Unit ? 'W' : 'BTU/h',
        powerCapInformation: {
          fieldName: {
            currentPower: this.$t('pagePower.tabs.tab2.currentPower'),
            peakPower: this.$t('pagePower.tabs.tab2.peakPower'),
            averagePower: this.$t('pagePower.tabs.tab2.averagePower'),
          },
          value: {
            currentPower: this.powerConsumptionValue,
            peakPower: this.currentPeakPower,
            averagePower: this.$store.getters['powerControl/averagePower'],
          },
        },
        totalConsumedPower: {
          fieldName: this.$t('pagePower.tabs.tab2.totalConsumedPower'),
          value: this.$store.getters['powerControl/totalConsumedPower'],
          unit: this.tab2Unit ? 'kWh' : 'BTU',
        },
      };
    },
  },
  watch: {
    powerConsumptionValue(value) {
      if (this.currentPeakPower < value) {
        this.currentPeakPower = value;
        this.$store.commit(
          'powerControl/setCurrentPeakPower',
          this.currentPeakPower
        );
        this.$store.dispatch('powerControl/getReadingRangeMax');
      }
    },
  },
  created() {
    this.$store.dispatch('global/getBmcTime');
    this.$store.dispatch('powerSupply/getAllPowerSupplies');
  },
  methods: {
    swap() {
      this.isTab2Unitw = !this.isTab2Unitw;
    },
    resetCalculate() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pagePower.table.modal.confirmMessage'), {
          title: this.$t('pagePower.table.modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) this.$store.dispatch('powerControl/startCalculate');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.power-supply-card,
.power-cap {
  border: 1px solid;
}
.power-number {
  font-size: 36px;
}
.unit {
  font-size: 14px;
  top: -17px;
}
.list-group-item {
  border: 1px solid $no-color;
}
.power-cap-value-field {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.power-cap-unit {
  white-space: nowrap;
}
.btn.active {
  background-color: $success !important;
}
button img {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
.reset-button button {
  padding-left: 14px;
}
</style>
