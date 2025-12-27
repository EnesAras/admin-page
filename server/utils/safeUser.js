const toPlainObject = (entity) => {
  if (!entity) return null;
  if (typeof entity.toObject === "function") {
    return entity.toObject();
  }
  return { ...entity };
};

const safeUser = (user) => {
  if (!user) return null;
  const entity = toPlainObject(user);
  if (!entity) return null;
  const { password, __v, _id, ...rest } = entity;
  const id = _id ? String(_id) : rest.id ? String(rest.id) : undefined;
  return { ...rest, id };
};

module.exports = safeUser;
