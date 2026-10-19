import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const shops = await strapi.documents('api::shop.shop').findMany({
      filters: { owner: { id: user.id } },
    });
    const shop = shops[0];
    if (!shop) return ctx.badRequest('Open a shop before adding items');

    const body = ctx.request.body?.data ?? {};
    if (!body.category) return ctx.badRequest('Choose a category');
    const product = await strapi.documents('api::product.product').create({
      data: {
        name: body.name,
        price: body.price,
        soldOut: false,
        shop: shop.documentId,
        category: body.category,
        ...(body.image ? { image: body.image } : {}),
      },
    });
    const populated = await strapi.documents('api::product.product').findOne({
      documentId: product.documentId,
      populate: { image: true, shop: true },
    });
    ctx.body = { data: populated };
  },
}));
