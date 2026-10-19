import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const body = ctx.request.body?.data ?? {};
    const address = await strapi.documents('api::address.address').create({
      data: {
        label: body.label,
        line: body.line,
        area: body.area ?? '',
        phone: body.phone,
        owner: user.documentId,
      },
    });
    ctx.body = { data: address };
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const addresses = await strapi.documents('api::address.address').findMany({
      filters: { owner: { id: user.id } },
    });
    ctx.body = { data: addresses };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const address = await strapi.documents('api::address.address').findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!address || address.owner?.id !== user.id) return ctx.notFound();
    ctx.body = { data: address };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const current = await strapi.documents('api::address.address').findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!current || current.owner?.id !== user.id) return ctx.notFound();
    const body = ctx.request.body?.data ?? {};
    const address = await strapi.documents('api::address.address').update({
      documentId: current.documentId,
      data: {
        ...(body.label ? { label: body.label } : {}),
        ...(body.line ? { line: body.line } : {}),
        ...(body.area !== undefined ? { area: body.area } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
      },
    });
    ctx.body = { data: address };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const current = await strapi.documents('api::address.address').findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!current || current.owner?.id !== user.id) return ctx.notFound();
    const removed = await strapi.documents('api::address.address').delete({
      documentId: current.documentId,
    });
    ctx.body = { data: removed };
  },
}));
