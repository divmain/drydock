import _ from "lodash";


export function getKeyDifferences (a, b) {
  const bClone = Object.assign({}, b);

  const onlyA = [];
  const both = [];

  Object.keys(a).forEach(key => {
    if (key in bClone) {
      both.push(key);
      delete bClone[key];
    } else {
      onlyA.push(key);
    }
  });

  return {
    a: onlyA,
    both,
    b: Object.keys(bClone)
  };
}

export default function jsonDiff (a, b) {
  const groupedKeys = getKeyDifferences(a, b);
  const added = {};
  const deleted = {};

  groupedKeys.both.forEach(key => {
    const aVal = a[key];
    const bVal = b[key];

    if (_.isObject(aVal) && _.isObject(bVal)) {
      const subDiff = jsonDiff(aVal, bVal);
      if (!_.isEmpty(subDiff.del)) { deleted[key] = subDiff.del; }
      if (!_.isEmpty(subDiff.add)) { added[key] = subDiff.add; }
    } else if (aVal !== bVal) {
      added[key] = bVal;
    }
  });

  const fresh = _.chain(groupedKeys.b)
    .map(key => [ key, b[key] ])
    .object()
    .value();

  const dead = _.chain(groupedKeys.a)
    .map(key => [ key, a[key] ])
    .object()
    .value();

  return {
    add: Object.assign({}, fresh, added),
    del: Object.assign({}, dead, deleted)
  };
}
