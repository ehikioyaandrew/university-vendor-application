import type { Core } from '@strapi/strapi';

const universities = [
  { name: 'University of Ibadan', slug: 'university-of-ibadan' },
  { name: 'UNILAG', slug: 'unilag' },
  { name: 'Babcock', slug: 'babcock' },
  { name: 'UNIPORT', slug: 'uniport' },
];

const publicActions = [
  'api::university.university.find',
  'api::university.university.findOne',
  'api::shop.shop.find',
  'api::shop.shop.findOne',
  'api::product.product.find',
  'api::product.product.findOne',
];

const sellerActions = [
  'api::shop.shop.create',
  'api::shop.shop.find',
  'api::shop.shop.findOne',
  'api::shop.shop.mine',
  'api::product.product.create',
  'api::product.product.find',
  'api::product.product.findOne',
  'api::product.product.update',
  'api::shop.shop.update',
  'api::order.order.create',
  'api::order.order.find',
  'api::order.order.findOne',
  'api::university.university.find',
  'api::university.university.findOne',
  'plugin::upload.content-api.upload',
  'plugin::upload.content-api.find',
  'plugin::upload.content-api.findOne',
];

async function allow(app: Core.Strapi, roleType: string, actions: string[]) {
  const role = await app.db.query('plugin::users-permissions.role').findOne({
    where: { type: roleType },
  });
  if (!role) return;

  for (const action of actions) {
    const existing = await app.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: role.id },
    });
    if (!existing) {
      await app.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const existing = await strapi.documents('api::university.university').findMany();
    if (existing.length === 0) {
      for (const university of universities) {
        await strapi.documents('api::university.university').create({
          data: university,
        });
      }
    }

    await allow(strapi, 'public', publicActions);
    await allow(strapi, 'authenticated', sellerActions);
  },
};
