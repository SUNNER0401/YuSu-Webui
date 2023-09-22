<template>
  <b-modal
    id="upload-confirm"
    :title="$t('pageConfigureManagement.modal.uploadTitle')"
    no-close-on-backdrop
    no-close-on-esc
    :ok-title="$t('global.action.confirm')"
    :cancel-title="$t('global.action.cancel')"
    @ok="ok"
    @cancel="cancel"
  >
    <div>
      <span>{{ $t('pageConfigureManagement.modal.uploadMessage') }}</span>
    </div>
    <template #modal-header>
      <div>
        <span class="modal-title">
          {{ $t('pageConfigureManagement.modal.uploadTitle') }}
        </span>
        <b-icon
          class="h4 mb-0"
          icon="exclamation-triangle"
          style="color: red"
          @click.stop="click"
        />
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'ModalImport',
  methods: {
    ok() {
      this.$emit('ok');
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>

<style></style>
