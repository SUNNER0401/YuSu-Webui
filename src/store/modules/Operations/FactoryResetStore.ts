import api from '@/store/api';
import i18n from '@/i18n';

const getters = {};

const state = {};

const mutations = {};

const actions = {
  async resetToDefaults() {
    return await api
      .post(
        '/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults',
        {
          ResetToDefaultsType: 'ResetAll',
        },
        undefined
      )
      .then(() => i18n.t('pageFactoryReset.toast.resetToDefaultsSuccess'))
      .catch((error) => {
        console.log('Factory Reset: ', error);
        throw new Error(
          i18n.t('pageFactoryReset.toast.resetToDefaultsError') as string
        );
      });
  },
  async resetBios() {
    return await api
      .post(
        '/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios',
        undefined,
        undefined
      )
      .then(() => i18n.t('pageFactoryReset.toast.resetBiosSuccess'))
      .catch((error) => {
        console.log('Factory Reset: ', error);
        throw new Error(
          i18n.t('pageFactoryReset.toast.resetBiosError') as string
        );
      });
  },
};

const FactoryResetStore = {
  namespaced: true,
  getters,
  state,
  mutations,
  actions,
};

export default FactoryResetStore;
