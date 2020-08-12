const _ = require('lodash');

const processPopulate = function (query) {
  const paths = query.split('.');
  let currentPopulate;
  while (paths.length) {
    const path = paths.pop();
    const populate = { path };
    if (currentPopulate) {
      currentPopulate = { path, populate: currentPopulate };
    } else {
      currentPopulate = populate;
    }
  }

  return currentPopulate;
}

const get = async (model, req, conditions = {}, multiple = true) => {

  const { query, params: { id } } = req;
  const { populate, typeId, type } = query;
  const limit = parseInt((query.limit) || '10', 10);
  const offset = parseInt((query.offset) || '0', 10);
  const orderBy = query.orderBy ? query.orderBy : 'createdAt';
  const order = query.order ? query.order : 'desc';

  delete query.limit;
  delete query.offset;
  delete query.populate;
  delete query.order;
  delete query.orderBy;
  delete query.typeId;
  delete query.type;

  if (!_.isEmpty(query)) {
    Object.keys(query).forEach((field) => {
      let value = query[field];
      switch (value) {
        case 'true':
          value = true;
          break;

        case 'false':
          value = false;
          break;

        default:
          break;
      }
      conditions[field] = value;
      console.log({ conditions })
    })
  }

  let q = model[multiple ? 'find' : 'findOne'](conditions);
  const temp = await model[multiple ? 'find' : 'findOne'](conditions);


  if (populate) {
    if (Array.isArray(populate) && populate.length) {
      populate.forEach((field) => {
        q = q.populate(processPopulate(field));
      });
    } else {
      q = q.populate(processPopulate(populate));
    }
  }

  if (multiple) {
    const total = await model.countDocuments(conditions);

    q = q.skip(offset).limit(limit).sort({ [orderBy]: order });;

    let data = await q.skip(offset).limit(limit);
    if (Array.isArray(data) && type && typeId) {
      if ((Array.isArray(populate) && populate.includes(type)) || (populate && populate == type)) {
        data = data.filter(a => {
          return (a[type].length > 0 && a[type].filter(x => {
            return String(x._id) === (String(typeId))
          }))
        })
      }
      else {
        data = data.filter(a => {
          return a[type].includes(String(typeId))
        })
      }
    }
    return {
      data,
      meta: { limit, offset, total },
    };
  }

  return await q;
};

exports.find = async (
  model, req, conditions = {},
) => await get(model, req, conditions, true);

exports.findOne = async (
  model, req, conditions = {},
) => await get(model, req, conditions, false);
