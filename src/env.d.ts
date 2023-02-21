export interface AddEventTarget extends EventTarget {
  parentElement?: { [index: string]: any };
  value?: string;
  nodeName: string;
}
