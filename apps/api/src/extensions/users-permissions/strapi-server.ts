// Plugin factories are untyped in the users-permissions package.
// @ts-nocheck
export default (plugin) => {
  const original = plugin.controllers.auth;

  plugin.controllers.auth = ({ strapi }) => {
    const auth = original({ strapi });

    auth.buyerRegister = async (ctx) => {
      const body = ctx.request.body ?? {};
      const digits = String(body.phone ?? '').replace(/\D/g, '');
      const name = String(body.name ?? '').trim();
      const password = String(body.password ?? '');
      if (digits.length < 10 || name.length < 2 || password.length < 6) {
        return ctx.badRequest('Phone, name, and a password of at least 6 characters are required');
      }

      const email = `${digits}@buyers.oja.local`;
      const taken = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email } });
      if (taken) return ctx.badRequest('That phone already has a buyer account');

      const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'customer' } });
      if (!role) return ctx.internalServerError('Buyer role is not ready');

      const user = await strapi.plugin('users-permissions').service('user').add({
        username: `buyer${digits}`,
        email,
        password,
        phone: digits,
        displayName: name,
        confirmed: true,
        provider: 'local',
        role: role.id,
      });
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
      ctx.body = {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: digits,
          displayName: name,
        },
      };
    };

    return auth;
  };

  plugin.routes['content-api'].routes.unshift({
    method: 'POST',
    path: '/auth/buyer/register',
    handler: 'auth.buyerRegister',
    config: { prefix: '', auth: false },
  });

  return plugin;
};
