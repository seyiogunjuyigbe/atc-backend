const { Ability, AbilityBuilder } = require('@casl/ability');

const { IRequest } = require('../shared/interface/request');

export const defineAbilitiesFor = (req) => {
  const { auth: user } = req;

  const { can, rules } = AbilityBuilder.extract();

  can('create', ['User']);

  if (user) {
    can('manage', 'all');
  }

  return new Ability(rules, {
    subjectName(subject) {
      if (!subject || typeof subject === 'string') {
        return subject;
      }

      const type = typeof subject === 'object' ? subject.constructor : subject;
      return type.modelName || type.name;
    },
  });
};
