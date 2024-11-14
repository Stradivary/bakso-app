// @see https://github.com/thymikee/jest-preset-angular/issues/336#issuecomment-1536232102
// @see https://github.com/orgs/mantinedev/discussions/467
const attributesToClean = {
  class: [/^m-.*$/],
  id: [/^mantine-.*$/],
  for: [/^mantine-.*$/],
  "aria-describedby": [/^mantine-.*$/],
  "aria-labelledby": [/^mantine-.*$/],
  "aria-controls": [/^mantine-.*$/],
  "data-focus-id": [/^mantine-.*$/],
};

const attributesToCleanKeys = Object.keys(attributesToClean);
const hasAttributesToClean = (attribute) =>
  attributesToCleanKeys.some((name) => attribute.name === name);
let lastCleanedNode = null;

module.exports = {
  print: (val, serialize) => {
    if (!val || !val.attributes) {
      return serialize(val);
    }

    const clone = val.cloneNode(true);

    // Check if clone has attributes after cloning
    if (!clone || !clone.attributes) {
      return serialize(clone);
    }

    const attributes = Object.values(clone.attributes);
    if (!attributes || !attributes.length) {
      return serialize(clone);
    }

    const attributesToProcess = attributes.filter(hasAttributesToClean);
    for (const attr of attributesToProcess) {
      if (attr && attr.value) {
        attr.value = attr.value
          .split(" ")
          .filter((attrValue) => {
            return !attributesToClean[attr.name].some((regex) =>
              regex.test(attrValue),
            );
          })
          .join(" ");
      }
    }
    lastCleanedNode = clone;
    return serialize(clone);
  },

  test: (val) => {
    if (!val || !val.attributes) {
      return false;
    }
    const attributes = Object.values(val.attributes);
    return (
      val !== lastCleanedNode &&
      attributes &&
      attributes.length > 0 &&
      attributes.some(hasAttributesToClean)
    );
  },
};
