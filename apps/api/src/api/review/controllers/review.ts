import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const body = ctx.request.body?.data ?? {};
    const stars = Number(body.stars);
    if (!body.comment || stars < 1 || stars > 5) {
      return ctx.badRequest('A rating from 1 to 5 and a comment are required');
    }

    const order = await strapi.documents('api::order.order').findOne({
      documentId: body.order,
      populate: { customer: true, shop: true },
    });
    if (!order || order.customer?.id !== user.id) {
      return ctx.forbidden('You can only rate your own order');
    }
    if (order.status !== 'paid' && order.status !== 'collected') {
      return ctx.badRequest('Rate an order after it is paid or collected');
    }

    const existing = await strapi.documents('api::review.review').findMany({
      filters: { order: { documentId: order.documentId }, author: { id: user.id } },
    });
    if (existing.length > 0) return ctx.badRequest('This order already has your rating');
    if (!order.shop) return ctx.badRequest('That order is not attached to a shop');

    const review = await strapi.documents('api::review.review').create({
      data: {
        stars,
        comment: body.comment,
        order: order.documentId,
        shop: order.shop.documentId,
        author: user.documentId,
      },
      populate: { shop: true, order: true },
    });
    ctx.body = { data: review };
  },
}));
