import { LIBRARY_NAME_IN_ERRORS_MESSAGE } from "./../globals";
import ComponentManager from "./component-manager";
import { ComponentThis } from "./components-this";
import { ComponentTemplateCallback, getComponentCallback } from "./components";
import ComponentThisFactory from "./component-this-factory";
import normalizeComponentName from "./normalize-component-name";
import getKeyInComponentName from "./get-key-in-component-name";
import getNextComponentDataInTemplate from "./get-next-component-data-in-template";
import { getComponentThisProps } from "./work-with-components-this";

type RunComponentCallbackReturn =
  | [componentThis: ComponentThis, result: string | ComponentTemplateCallback]
  | [componentThis: undefined, result: string | ComponentTemplateCallback];

type processComponentsResult = [
  result: string,
  componentsThis: ComponentThis[],
  componentsManager: ComponentManager[]
];

function runComponentCallback(
  name: string,
  children: string,
  parent?: ComponentThis
): RunComponentCallbackReturn {
  let result = "";
  const realComponentName = normalizeComponentName(name);

  const componentCallback = getComponentCallback(realComponentName);

  if (!componentCallback)
    throw `${LIBRARY_NAME_IN_ERRORS_MESSAGE} The component "${realComponentName}" was not created!`;

  const componentThis = ComponentThisFactory(name, parent);

  componentThis.children = children;

  if (parent) assignPropsToComponentChild(parent, componentThis);

  result = (componentCallback as any).call(componentThis, componentThis);
  return [componentThis, result];
}

function assignPropsToComponentChild(
  parent: ComponentThis,
  child: ComponentThis
) {
  const childProps = getComponentThisProps(
    parent,
    getKeyInComponentName(child.name)
  );

  if (childProps) {
    Object.assign(child.props, childProps);
  }
}

function getTemplateWithCurrentPropsValues(
  template: string,
  componentsManager: ComponentManager[]
) {
  let newTemplate = template;

  for (const componentManager of componentsManager) {
    const componentData = getNextComponentDataInTemplate(newTemplate);

    if (!componentData) continue;

    const value = componentManager.getCurrentTemplateWithHost();

    componentManager.updateLastTemplateValueProperty();

    newTemplate = componentData.before + value + componentData.after;
  }

  return newTemplate;
}

function processEachTemplate(
  template: string,
  componentsManager: ComponentManager[],
  parent?: ComponentThis
): ComponentManager[] {
  let newTemplate = template;
  let componentData: ReturnType<typeof getNextComponentDataInTemplate>;

  while ((componentData = getNextComponentDataInTemplate(newTemplate))) {
    const [componentThis, result] = runComponentCallback(
      componentData.name,
      componentData.children,

      parent
    );

    if (!componentThis) continue;

    const componentManager = new ComponentManager(componentThis, result);

    componentsManager.push(componentManager);

    processEachTemplate(
      componentManager.getCurrentTemplateWithHost(),
      componentsManager,
      componentThis
    );

    newTemplate = componentData.before + componentData.after;
  }

  return componentsManager;
}

export default function processComponentsInTemplate(
  template: string,
  firstParent?: ComponentThis
): processComponentsResult {
  const componentsManager = processEachTemplate(template, [], firstParent);

  const newTemplate = getTemplateWithCurrentPropsValues(
    template,
    componentsManager
  );

  const componentsThis = componentsManager.map((o) => o.componentThis);

  return [newTemplate, componentsThis, componentsManager];
}
