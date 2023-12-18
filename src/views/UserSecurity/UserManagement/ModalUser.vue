<template>
  <b-modal
    id="modal-user"
    ref="modal"
    no-close-on-backdrop
    no-close-on-esc
    @hidden="resetForm"
  >
    <template #modal-title>
      <template v-if="newUser">
        {{ $t('pageUserManagement.addUser') }}
      </template>
      <template v-else>
        {{ $t('pageUserManagement.editUser') }}
      </template>
    </template>
    <b-form id="form-user" novalidate @submit.prevent="handleSubmit">
      <b-container>
        <!-- Manual unlock form control -->
        <b-row v-if="!newUser && manualUnlockPolicy && user.Locked">
          <b-col sm="9">
            <alert :show="true" variant="warning" small>
              <template v-if="!$v.form.manualUnlock.$dirty">
                {{ $t('pageUserManagement.modal.accountLocked') }}
              </template>
              <template v-else>
                {{ $t('pageUserManagement.modal.clickSaveToUnlockAccount') }}
              </template>
            </alert>
          </b-col>
          <b-col sm="3">
            <input
              v-model="form.manualUnlock"
              data-test-id="userManagement-input-manualUnlock"
              type="hidden"
              value="false"
            />
            <b-button
              variant="primary"
              :disabled="$v.form.manualUnlock.$dirty"
              data-test-id="userManagement-button-manualUnlock"
              @click="$v.form.manualUnlock.$touch()"
            >
              {{ $t('pageUserManagement.modal.unlock') }}
            </b-button>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-group :label="$t('pageUserManagement.modal.accountStatus')">
              <b-form-radio
                v-model="form.status"
                name="user-status"
                :value="true"
                data-test-id="userManagement-radioButton-statusEnabled"
                @input="$v.form.status.$touch()"
              >
                {{ $t('global.status.enabled') }}
              </b-form-radio>
              <b-form-radio
                v-if="form.username != 'root'"
                v-model="form.status"
                name="user-status"
                data-test-id="userManagement-radioButton-statusDisabled"
                :value="false"
                @input="$v.form.status.$touch()"
              >
                {{ $t('global.status.disabled') }}
              </b-form-radio>
            </b-form-group>
            <b-form-group
              :label="$t('pageUserManagement.modal.username')"
              label-for="username"
            >
              <b-form-text id="username-help-block">
                {{ $t('pageUserManagement.modal.cannotStartWithANumber') }}
                <br />
                {{
                  $t(
                    'pageUserManagement.modal.noSpecialCharactersExceptUnderscore'
                  )
                }}
              </b-form-text>
              <b-form-input
                id="username"
                v-model="form.username"
                type="text"
                aria-describedby="username-help-block"
                data-test-id="userManagement-input-username"
                :state="getValidationState($v.form.username)"
                :disabled="!newUser && originalUsername === 'root'"
                autocomplete="off"
                @input="$v.form.username.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.username.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
                <template v-else-if="!$v.form.username.maxLength">
                  {{
                    $t('global.form.lengthMustBeBetween', { min: 1, max: 16 })
                  }}
                </template>
                <template v-else-if="!$v.form.username.pattern">
                  {{ $t('global.form.invalidFormat') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group
              v-if="form.username != 'root'"
              :label="$t('pageUserManagement.modal.privilege')"
              label-for="privilege"
            >
              <b-form-select
                id="privilege"
                v-model="form.privilege"
                :options="privilegeTypes"
                data-test-id="userManagement-select-privilege"
                :state="getValidationState($v.form.privilege)"
                @input="$v.form.privilege.$touch()"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ $t('global.form.selectAnOption') }}
                  </b-form-select-option>
                </template>
              </b-form-select>
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.privilege.required">
                  {{ $t('global.form.fieldRequired') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              v-if="newUser"
              :label="$t('pageUserManagement.modal.userPassword')"
              label-for="password"
            >
              <b-form-text id="password-help-block">
                {{
                  $t('pageUserManagement.modal.passwordMustBeBetween', {
                    min: passwordRequirements.minLength,
                    max: passwordRequirements.maxLength,
                  })
                }}
              </b-form-text>
              <input-password-toggle>
                <b-form-input
                  id="password"
                  v-model="form.password"
                  type="password"
                  data-test-id="userManagement-input-password"
                  aria-describedby="password-help-block"
                  :state="
                    !$v.form.password.required && !newUser
                      ? true
                      : getValidationState($v.form.password)
                  "
                  class="form-control-with-button"
                  @input="$v.form.password.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template v-if="newUser && !$v.form.password.required">
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template
                    v-if="
                      !$v.form.password.minLength || !$v.form.password.maxLength
                    "
                  >
                    {{
                      $t('pageUserManagement.modal.passwordMustBeBetween', {
                        min: passwordRequirements.minLength,
                        max: passwordRequirements.maxLength,
                      })
                    }}
                  </template>
                  <template
                    v-else-if="
                      $v.form.password.required && !$v.form.password.pattern
                    "
                  >
                    {{ $t('global.form.simplePassword') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              v-if="newUser"
              :label="$t('pageUserManagement.modal.confirmUserPassword')"
              label-for="password-confirmation"
            >
              <input-password-toggle>
                <b-form-input
                  id="password-confirmation"
                  v-model="form.passwordConfirmation"
                  data-test-id="userManagement-input-passwordConfirmation"
                  type="password"
                  :state="
                    !$v.form.passwordConfirmation.required && !newUser
                      ? true
                      : getValidationState($v.form.passwordConfirmation)
                  "
                  class="form-control-with-button"
                  @input="$v.form.passwordConfirmation.$touch()"
                />
                <b-form-invalid-feedback role="alert">
                  <template
                    v-if="newUser && !$v.form.passwordConfirmation.required"
                  >
                    {{ $t('global.form.fieldRequired') }}
                  </template>
                  <template
                    v-else-if="!$v.form.passwordConfirmation.sameAsPassword"
                  >
                    {{ $t('pageUserManagement.modal.passwordsDoNotMatch') }}
                  </template>
                </b-form-invalid-feedback>
              </input-password-toggle>
            </b-form-group>
            <b-form-group
              :label="$t('pageUserManagement.modal.maxDaysExpired')"
              label-for="max-days-expired"
            >
              <b-form-input
                id="max-days-expired"
                v-model="form.maxDaysExpired"
                data-test-id="userManagement-input-maxDaysExpired"
                :state="getValidationState($v.form.maxDaysExpired)"
                class="form-control-with-button"
                autocomplete="off"
                @input="$v.form.maxDaysExpired.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <template v-if="!$v.form.maxDaysExpired.numeric">
                  {{ $t('global.form.invalidFormat') }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="userManagement-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-user"
        data-test-id="userManagement-button-submit"
        type="submit"
        variant="primary"
        @click="onOk"
      >
        <template v-if="newUser">
          {{ $t('pageUserManagement.addUser') }}
        </template>
        <template v-else>
          {{ $t('global.action.save') }}
        </template>
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  required,
  maxLength,
  minLength,
  sameAs,
  helpers,
  requiredIf,
  numeric,
} from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert, InputPasswordToggle },
  mixins: [VuelidateMixin],
  props: {
    user: {
      type: Object,
      default: null,
    },
    passwordRequirements: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      originalUsername: '',
      form: {
        status: true,
        username: '',
        privilege: null,
        password: '',
        passwordConfirmation: '',
        manualUnlock: false,
        maxDaysExpired: '',
      },
    };
  },
  computed: {
    newUser() {
      return this.user ? false : true;
    },
    accountSettings() {
      return this.$store.getters['userManagement/accountSettings'];
    },
    manualUnlockPolicy() {
      return !this.accountSettings.accountLockoutDuration;
    },
    privilegeTypes() {
      return this.$store.getters['userManagement/accountRoles'];
    },
  },
  watch: {
    user: function (
      value: {
        [index: string]: string;
      } | null
    ) {
      if (value === null) return;
      this.originalUsername = value.username;
      this.form.username = value.username;
      this.form.status = value.Enabled;
      this.form.privilege = value.privilege;
      this.form.maxDaysExpired = value.PasswordExpirationDays;
    },
  },
  //@ts-ignore
  validations() {
    return {
      form: {
        status: {
          required,
        },
        username: {
          required,
          maxLength: maxLength(16),
          pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/),
        },
        privilege: {
          required,
        },
        password: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength),
          pattern: (value: string) => {
            const trimValue = value.trim();
            let partern1 = /[a-zA-Z]+/;
            let partern2 = /[0-9]+/;
            let partern3 = /\W+/;
            let status =
              partern1.test(trimValue) &&
              partern2.test(trimValue) &&
              partern3.test(trimValue);
            return status;
          },
        },
        passwordConfirmation: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          sameAsPassword: sameAs('password'),
        },
        manualUnlock: {},
        maxDaysExpired: {
          numeric,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      let userData: {
        [index: string]: string | boolean;
      } = {};
      this.$v.$touch();
      if (this.newUser) {
        if (this.$v.$invalid) return;
        userData.username = this.form.username;
        userData.status = this.form.status;
        userData.privilege = this.form.privilege;
        userData.password = this.form.password;
        userData.maxdaysexpired = this.form.maxDaysExpired;
      } else {
        if (this.$v.$invalid) {
          if (
            this.$v.form.password.required ||
            this.$v.form.passwordConfirmation.required
          )
            return;
          else {
            if (
              this.$v.form.manualUnlock.$error ||
              this.$v.form.maxDaysExpired.$error ||
              this.$v.form.privilege.$error ||
              this.$v.form.status.$error ||
              this.$v.form.username.$error
            )
              return;
          }
        }
        userData.originalUsername = this.originalUsername;
        if (this.$v.form.status.$dirty) {
          userData.status = this.form.status;
        }
        if (this.$v.form.username.$dirty) {
          userData.username = this.form.username;
        }
        if (this.$v.form.privilege.$dirty) {
          userData.privilege = this.form.privilege;
        }
        if (this.$v.form.password.$dirty && this.$v.form.password.required) {
          userData.password = this.form.password;
        }
        if (this.$v.form.maxDaysExpired.$dirty) {
          userData.maxdaysexpired = this.form.maxDaysExpired;
        }
        if (this.$v.form.manualUnlock.$dirty) {
          // If form manualUnlock control $dirty then
          // set user Locked property to false
          userData.locked = false;
        }
        if (Object.entries(userData).length === 1) {
          this.closeModal();
          return;
        }
      }
      this.$emit('ok', { isNewUser: this.newUser, userData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.originalUsername = '';
      this.form.status = true;
      this.form.username = '';
      this.form.privilege = null;
      this.form.password = '';
      this.form.passwordConfirmation = '';
      this.form.maxDaysExpired = '';
      this.$v.$reset();
      this.$emit('hidden');
    },
    requirePassword() {
      if (this.newUser) return true;
      return false;
    },
    onOk(bvModalEvt: { preventDefault: () => void }) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
