import { factories, type Core } from '@strapi/strapi';
import { buildBook, type BookOrder, type SalesRange } from '../book';

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
    if (!shop) return ctx.badRequest('Open a shop before recording a sale');

    const body = ctx.request.body?.data ?? {};
    const buyerName = String(body.buyerName ?? '').trim();
    if (buyerName.length < 2) return ctx.badRequest('Add the buyer name');
    const quantity = Number(body.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1) return ctx.badRequest('Quantity starts at 1');

    let amount = Number(body.amount);
    let productId: string | undefined;
    if (body.product) {
      const product = await strapi.documents('api::product.product').findOne({
        documentId: body.product,
        populate: { shop: true },
      });
      if (!product || product.shop?.documentId !== shop.documentId) {
        return ctx.badRequest('That item is not on your stall');
      }
      amount = Number(product.price) * quantity;
      productId = product.documentId;
    }
    if (!Number.isInteger(amount) || amount < 0) return ctx.badRequest('Amount is in whole naira');

    let paymentMethod: 'cash' | 'transfer' | undefined;
    if (body.paymentMethod) {
      if (body.paymentMethod !== 'cash' && body.paymentMethod !== 'transfer') {
        return ctx.badRequest('Payment is cash or transfer');
      }
      paymentMethod = body.paymentMethod;
    }

    const order = await strapi.documents('api::order.order').create({
      data: {
        buyerName,
        amount,
        quantity,
        status: paymentMethod ? 'paid' : 'owed',
        shop: shop.documentId,
        ...(productId ? { product: productId } : {}),
        ...(paymentMethod ? { paymentMethod, paidAt: new Date().toISOString() } : {}),
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
        quantity: 1,
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
      limit: 500,
    });
    ctx.body = { data: orders };
  },

  async summary(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    const asked = ctx.query.range;
    const range: SalesRange = asked === 'week' || asked === 'month' ? asked : 'day';
    if (!shop) {
      ctx.body = { data: buildBook([], range) };
      return;
    }
    const orders = await strapi.documents('api::order.order').findMany({
      filters: { shop: { documentId: shop.documentId } },
      populate: { product: true },
      sort: 'createdAt:desc',
      limit: 500,
    });
    ctx.body = { data: buildBook(orders as unknown as BookOrder[], range) };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const shop = await ownedShop(strapi, user);
    const current = await strapi.documents('api::order.order').findOne({
      documentId: ctx.params.id,
      populate: { shop: true },
    });
    const saved = current as typeof current & {
      paymentMethod?: 'cash' | 'transfer' | null;
      paidAt?: string | null;
    };
    if (!saved || !shop || saved.shop?.documentId !== shop.documentId) return ctx.notFound();
    const body = ctx.request.body?.data ?? {};
    const data: {
      status?: 'owed' | 'paid' | 'collected' | 'cancelled';
      paymentMethod?: 'cash' | 'transfer';
      paidAt?: string;
    } = {};
    if (body.status) {
      if (!['owed', 'paid', 'collected', 'cancelled'].includes(body.status)) {
        return ctx.badRequest('Unknown order status');
      }
      data.status = body.status;
    }
    if (body.paymentMethod) {
      if (body.paymentMethod !== 'cash' && body.paymentMethod !== 'transfer') {
        return ctx.badRequest('Payment is cash or transfer');
      }
      data.paymentMethod = body.paymentMethod;
    }
    if (!data.status && !data.paymentMethod) return ctx.badRequest('Nothing to update');

    const status = data.status ?? saved.status;
    const method = data.paymentMethod ?? saved.paymentMethod;
    if ((status === 'paid' || status === 'collected') && !method) {
      return ctx.badRequest('Choose cash or transfer');
    }
    if ((status === 'paid' || status === 'collected') && !saved.paidAt) {
      data.paidAt = new Date().toISOString();
    }

    const order = await strapi.documents('api::order.order').update({
      documentId: saved.documentId,
      data,
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
