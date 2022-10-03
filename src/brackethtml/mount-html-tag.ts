import isSelfClosingTag from "./is-self-closing-tag";
import { TagPropsTree } from "./types/template";

export default function mountHTMLTag(tagProps: TagPropsTree | string) {
  if (typeof tagProps === "string") {
    return tagProps;
  }

  const { tagName, children, attributes, cssClassName } = tagProps;
  let tagAttrs = attributes;
  if (cssClassName) {
    tagAttrs = tagAttrs.replaceAll(/(\s*=\s*)/g, "=");
    const classAttrIndex = tagAttrs.search(/(?<=\s?class=")/);

    if (classAttrIndex > -1) {
      tagAttrs = `${tagAttrs.slice(
        0,
        classAttrIndex
      )}${cssClassName} ${tagAttrs.slice(classAttrIndex)}`;
    } else {
      tagAttrs += `class = "${cssClassName}"`;
    }
  }

  let tagChildren = "";

  if (children) {
    for (const childTagProps of children) {
      tagChildren += mountHTMLTag(childTagProps);
    }
  }

  if (isSelfClosingTag(tagName)) return `<${tagName} ${tagAttrs}/>`;

  return `<${tagName} ${tagAttrs}>${tagChildren}</${tagName}>`;
}
