import type { Core } from '@strapi/strapi';

const universities = [
  { name: 'University of Ibadan', slug: 'university-of-ibadan' },
  { name: 'UNILAG', slug: 'unilag' },
  { name: 'Babcock', slug: 'babcock' },
  { name: 'UNIPORT', slug: 'uniport' },
];

const categories = [
  { name: 'Food', slug: 'food' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Gadgets', slug: 'gadgets' },
  { name: 'Print', slug: 'print' },
];

const publicActions = [
  'api::university.university.find',
  'api::university.university.findOne',
  'api::shop.shop.find',
  'api::shop.shop.findOne',
  'api::product.product.find',
  'api::product.product.findOne',
  'api::review.review.find',
  'api::review.review.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
];

const customerActions = [
  'api::address.address.create',
  'api::address.address.find',
  'api::address.address.findOne',
  'api::address.address.update',
  'api::address.address.delete',
  'api::order.order.place',
  'api::order.order.history',
  'api::order.order.findOne',
  'api::review.review.create',
  'api::review.review.find',
  'api::review.review.findOne',
  'api::product.product.find',
  'api::product.product.findOne',
  'api::shop.shop.find',
  'api::shop.shop.findOne',
  'api::university.university.find',
  'api::university.university.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
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
  'api::order.order.update',
  'api::order.order.summary',
  'api::university.university.find',
  'api::university.university.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
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

    const listed = await strapi.documents('api::category.category').findMany();
    if (listed.length === 0) {
      for (const category of categories) {
        await strapi.documents('api::category.category').create({ data: category });
      }
    }

    const customer = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'customer' },
    });
    if (!customer) {
      await strapi.db.query('plugin::users-permissions.role').create({
        data: {
          name: 'Customer',
          description: 'Buyers who order, save a delivery address, and leave a rating',
          type: 'customer',
        },
      });
    }

    await allow(strapi, 'public', publicActions);
    await allow(strapi, 'authenticated', sellerActions);
    await allow(strapi, 'customer', customerActions);
  },
};
