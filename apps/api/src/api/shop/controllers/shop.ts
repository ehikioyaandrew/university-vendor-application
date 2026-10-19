import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::shop.shop', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Log in before opening a shop');

    const existing = await strapi.documents('api::shop.shop').findMany({
      filters: { owner: { id: user.id } },
    });
    if (existing.length > 0) {
      return ctx.badRequest('You already have a shop');
    }

    const body = ctx.request.body?.data ?? {};
    const shop = await strapi.documents('api::shop.shop').create({
      data: {
        name: body.name,
        spot: body.spot,
        university: body.university,
        owner: user.documentId,
      },
    });
    ctx.body = { data: shop };
  },

  async mine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shops = await strapi.documents('api::shop.shop').findMany({
      filters: { owner: { id: user.id } },
      populate: { university: true, products: true },
    });
    ctx.body = { data: shops[0] ?? null };
  },
}));
