import Vue, { VNode } from 'vue';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {
      disabled?: boolean;
    }
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface AddEventTarget extends EventTarget {
      parentElement?: { [index: string]: any };
    }
  }
}
