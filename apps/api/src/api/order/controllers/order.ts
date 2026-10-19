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

  async place(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const body = ctx.request.body?.data ?? {};
    const fulfillment = body.fulfillment === 'delivery' ? 'delivery' : 'pickup';
    if (fulfillment === 'delivery' && !body.address) {
      return ctx.badRequest('Add a delivery address before placing this order');
    }

    const product = await strapi.documents('api::product.product').findOne({
      documentId: body.product,
      populate: { shop: true },
    });
    if (!product || product.soldOut || !product.shop) {
      return ctx.badRequest('That item is not available');
    }

    if (body.address) {
      const address = await strapi.documents('api::address.address').findOne({
        documentId: body.address,
        populate: { owner: true },
      });
      if (!address || address.owner?.id !== user.id) return ctx.forbidden('That address is not yours');
    }

    const order = await strapi.documents('api::order.order').create({
      data: {
        buyerName: user.displayName || user.username,
        amount: Number(product.price),
        status: 'owed',
        fulfillment,
        note: body.note ?? '',
        shop: product.shop.documentId,
        product: product.documentId,
        customer: user.documentId,
        ...(body.address ? { address: body.address } : {}),
      },
    });
    const populated = await strapi.documents('api::order.order').findOne({
      documentId: order.documentId,
      populate: { product: true, shop: true, address: true },
    });
    ctx.body = { data: populated };
  },

  async history(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const orders = await strapi.documents('api::order.order').findMany({
      filters: { customer: { id: user.id } },
      populate: { product: true, shop: true, address: true, receipt: true },
      sort: 'createdAt:desc',
    });
    ctx.body = { data: orders };
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
      populate: { receipt: true, product: true, customer: true, address: true },
      sort: 'createdAt:desc',
    });
    ctx.body = { data: orders };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    const current = await strapi.documents('api::order.order').findOne({
      documentId: ctx.params.id,
      populate: { shop: true },
    });
    if (!current || !shop || current.shop?.documentId !== shop.documentId) return ctx.notFound();
    const status = ctx.request.body?.data?.status;
    if (!['owed', 'paid', 'collected', 'cancelled'].includes(status)) {
      return ctx.badRequest('Unknown order status');
    }
    const order = await strapi.documents('api::order.order').update({
      documentId: current.documentId,
      data: { status },
    });
    ctx.body = { data: order };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    const order = await strapi.documents('api::order.order').findOne({
      documentId: ctx.params.id,
      populate: { receipt: true, product: true, shop: true, customer: true, address: true },
    });
    const ownsShop = Boolean(shop && order?.shop?.documentId === shop.documentId);
    const ownsOrder = order?.customer?.id === user.id;
    if (!order || (!ownsShop && !ownsOrder)) {
      return ctx.notFound();
    }
    ctx.body = { data: order };
  },
}));
