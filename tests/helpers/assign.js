import Ember from 'ember';

export default Object.assign || function(initial, ...rest) {
  return rest.reduce(((result, object) => Ember.merge(result, object)), initial);
};

