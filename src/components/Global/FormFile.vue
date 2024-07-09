<template>
  <div class="custom-form-file-container">
    <label>
      <b-form-file
        :id="id"
        v-model="files"
        :accept="accept"
        :disabled="disabled"
        :state="state"
        plain
        multiple
        @input="$emit('input', files)"
      >
      </b-form-file>
      <span
        class="add-file-btn btn"
        :class="{
          disabled,
          'btn-secondary': isSecondary,
          'btn-primary': !isSecondary,
        }"
      >
        {{ name }}
      </span>
      <slot name="invalid"></slot>
    </label>
    <!-- <div v-if="file" class="clear-selected-file px-3 py-2 mt-2">
      {{ file ? file.name : '' }}
      <b-button
        variant="light"
        class="px-2 ml-auto"
        :disabled="disabled"
        @click="file = null"
        ><icon-close :title="$t('global.fileUpload.clearSelectedFile')" /><span
          class="sr-only"
          >{{ $t('global.fileUpload.clearSelectedFile') }}</span
        >
      </b-button>
    </div> -->
    <div v-if="files && files.length > 0" class="mt-2">
      <template v-for="(file, index) in files">
        <div :key="index" class="clear-selected-file px-3 py-2">
          <input
            v-model="selectedFiles[file.name]"
            type="checkbox"
            class="mr-2"
          />
          <!-- 复选框 -->
          {{ file.name }}
          <b-button
            variant="light"
            class="px-2 ml-auto"
            :disabled="disabled"
            @click="removeFile(file)"
          >
            <icon-close :title="$t('global.fileUpload.clearSelectedFile')" />
            <span class="sr-only">{{
              $t('global.fileUpload.clearSelectedFile')
            }}</span>
          </b-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { BFormFile } from 'bootstrap-vue';
import IconClose from '@carbon/icons-vue/es/close/20';

export default {
  name: 'FormFile',
  components: { BFormFile, IconClose },
  props: {
    name: {
      type: String,
      default: function name() {
        return this.$t('global.fileUpload.browseText');
      },
    },
    id: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    accept: {
      type: String,
      default: '',
    },
    state: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: 'secondary',
    },
  },
  data() {
    return {
      files: [] as File[], // 使用数组来存储多个文件
      selectedFiles: {} as Record<string, boolean>, // 用于存储选择的文件及其状态
    };
  },
  computed: {
    isSecondary() {
      return this.variant === 'secondary';
    },
  },
  methods: {
    removeFile(file: File) {
      this.files = this.files.filter(f => f !== file);
      delete this.selectedFiles[file.name];
      this.$emit('input', this.files);
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  border-radius: 20px;
}
input[type='file'] {
  display: none;
}
.form-control-file {
  opacity: 0;
  height: 0;
  &:focus + span {
    box-shadow: inset 0 0 0 3px theme-color('primary'), inset 0 0 0 5px $white;
  }
}

// Get mouse pointer on complete element
.add-file-btn {
  position: relative;
  &.disabled {
    border-color: gray('400');
    background-color: gray('400');
    color: gray('600');
    box-shadow: none !important;
  }
}

.clear-selected-file {
  display: flex;
  align-items: center;
  background-color: theme-color('light');
  .btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;

    &:focus {
      box-shadow: inset 0 0 0 2px theme-color('primary');
    }
  }
}
</style>
