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
        ...(body.cover ? { cover: body.cover } : {}),
      },
    });
    ctx.body = { data: shop };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shops = await strapi.documents('api::shop.shop').findMany({
      filters: { owner: { id: user.id } },
    });
    const shop = shops[0];
    if (!shop || shop.documentId !== ctx.params.id) return ctx.forbidden();

    const body = ctx.request.body?.data ?? {};
    const updated = await strapi.documents('api::shop.shop').update({
      documentId: shop.documentId,
      data: {
        ...(body.cover ? { cover: body.cover } : {}),
      },
      populate: { cover: true, university: true, products: { populate: { image: true, category: true } } },
    });
    ctx.body = { data: updated };
  },

  async mine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shops = await strapi.documents('api::shop.shop').findMany({
      filters: { owner: { id: user.id } },
      populate: { cover: true, university: true, products: { populate: { image: true, category: true } } },
    });
    ctx.body = { data: shops[0] ?? null };
  },
}));
