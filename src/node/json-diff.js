var
  _ = require("lodash");

function getKeyDifferences (first, second) {
  var sortedKeys = {
    first: [],
    both: [],
    second: []
  };
  second = _.clone(second);

  _.chain(first)
    .keys()
    .each(function (k) {

      if (k in second) {
        sortedKeys.both.push(k);
        delete second[k];
      } else {
        sortedKeys.first.push(k);
      }
    });

  sortedKeys.second = _.keys(second);

  return sortedKeys;
}

function jsonDiff (first, second) {
  var fresh, dead,
    groupedKeys = getKeyDifferences(first, second),
    added = {},
    deleted = {};

  fresh = _.chain(groupedKeys.second)
    .map(function (key) {
      return [ key, second[key] ];
    })
    .object()
    .value();

  dead = _.chain(groupedKeys.first)
    .map(function (key) {
      return [ key, first[key] ];
    })
    .object()
    .value();

  _.each(groupedKeys.both, function (key) {
    var subDiff,
      firstObj = first[key],
      secondObj = second[key];

    if (_.isObject(firstObj) && _.isObject(secondObj)) {
      subDiff = jsonDiff(firstObj, secondObj);
      if (!_.isEmpty(subDiff.del)) { deleted[key] = subDiff.del; }
      if (!_.isEmpty(subDiff.add)) { added[key] = subDiff.add; }
    } else if (firstObj !== secondObj) {
      added[key] = secondObj;
    }
  });

  return {
    add: _.extend({}, fresh, added),
    del: _.extend({}, dead, deleted)
  };
}

jsonDiff.getKeyDifferences = getKeyDifferences;

module.exports = jsonDiff;
