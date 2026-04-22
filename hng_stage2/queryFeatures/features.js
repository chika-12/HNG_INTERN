const queryBuilder = (query) => {
  const filter = {};
  if (query.gender) {
    filter.gender = query.gender;
  }
  if (query.age_group) {
    filter.age_group = query.age_group;
  }
  if (query.country_id) {
    filter.country_id = query.country_id.toUpperCase();
  }
  if (query.min_age || query.max_age) {
    filter.age = {};
    if (query.min_age) filter.age.$gte = Number(query.min_age);
    if (query.max_age) filter.age.$lte = Number(query.max_age);
  }

  if (query.min_gender_probability) {
    filter.gender_probability = { $gte: Number(query.min_gender_probability) };
  }

  if (query.min_country_probability) {
    filter.country_probability = {
      $gte: Number(query.min_country_probability),
    };
  }

  const sortBy = query.sort ? query.sort.split(',').join(' ') : '-created_at';

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { filter, sortBy, page, limit, skip };
};

module.exports = queryBuilder;
