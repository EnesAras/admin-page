const toPlainObject = (entity) => {
  if (!entity) return null;
  if (typeof entity.toObject === "function") {
    return entity.toObject();
  }
  return { ...entity };
};

const safeProduct = (product) => {
  if (!product) return null;
  const entity = toPlainObject(product);
  if (!entity) return null;
  const { __v, _id, ...rest } = entity;
  return { ...rest, id: _id ? String(_id) : rest.id };
};

module.exports = safeProduct;
