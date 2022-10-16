import { LIBRARY_NAME_IN_ERRORS_MESSAGE } from "../globals";
import ComponentInstance from "./component-instance";
import { ComponentThis } from "./components-this";

type GlobalComponentsMap = Map<string, ComponentFn>;

const GLOBAL_COMPONENTS_MAP: GlobalComponentsMap = new Map();

export type ComponentFn =
  | ((self: ComponentThis) => () => string)
  | ((self: ComponentThis) => string);

export type ComponentTemplateCallback = () => string;

export function getComponentFn(componentName: string) {
  return GLOBAL_COMPONENTS_MAP.get(componentName);
}

/**
 * Check if the component is available.
 *
 * @param name
 * The component name.
 */
export function hasComponent(name: string) {
  return GLOBAL_COMPONENTS_MAP.get(name) ? true : false;
}

/**
 *
 * @param componentName
 * The component name.
 * It must always start with an uppercase character (CamelCase) and accepts all
 * alphanumeric characters and the `:` symbol.
 *
 * @param componentFn
 *  The function responsible for managing the component instance.
 *  It must always return a `string` or a function that returns a `string`.
 *
 * @returns
 * The component creation instance.
 */
export function Component<N extends string, C extends ComponentFn>(
  componentName: N,
  componentFn: C
) {
  if (GLOBAL_COMPONENTS_MAP.has(componentName)) {
    throw `${LIBRARY_NAME_IN_ERRORS_MESSAGE} This component "${componentName}" name is already in use!`;
  }

  GLOBAL_COMPONENTS_MAP.set(componentName, componentFn);

  return new ComponentInstance(componentName);
}
export const _ = Component;
