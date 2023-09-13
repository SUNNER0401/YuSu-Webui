export interface AddEventTarget extends EventTarget {
  parentElement?: { [index: string]: any };
  value?: string;
  nodeName: string;
  blur(): function;
  files?: { [index: string]: any };
  innerHTML: string;
}
