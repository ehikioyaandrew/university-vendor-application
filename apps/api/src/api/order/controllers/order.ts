import { factories, type Core } from '@strapi/strapi';

async function ownedShop(strapi: Core.Strapi, user: { id: number }) {
  const shops = await strapi.documents('api::shop.shop').findMany({
    filters: { owner: { id: user.id } },
  });
  return shops[0] ?? null;
}

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    if (!shop) return ctx.badRequest('Open a shop before saving a receipt');

    const body = ctx.request.body?.data ?? {};
    const order = await strapi.documents('api::order.order').create({
      data: {
        buyerName: body.buyerName,
        amount: body.amount,
        status: 'owed',
        shop: shop.documentId,
        ...(body.product ? { product: body.product } : {}),
        ...(body.receipt ? { receipt: body.receipt } : {}),
      },
    });
    const populated = await strapi.documents('api::order.order').findOne({
      documentId: order.documentId,
      populate: { receipt: true, product: true },
    });
    ctx.body = { data: populated };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    if (!shop) {
      ctx.body = { data: [] };
      return;
    }
    const orders = await strapi.documents('api::order.order').findMany({
      filters: { shop: { documentId: shop.documentId } },
      populate: { receipt: true, product: true },
      sort: 'createdAt:desc',
    });
    ctx.body = { data: orders };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    const order = await strapi.documents('api::order.order').findOne({
      documentId: ctx.params.id,
      populate: { receipt: true, product: true, shop: true },
    });
    if (!order || !shop || order.shop?.documentId !== shop.documentId) {
      return ctx.notFound();
    }
    ctx.body = { data: order };
  },
}));
