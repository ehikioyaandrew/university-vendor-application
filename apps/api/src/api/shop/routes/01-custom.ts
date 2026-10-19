export default {
  routes: [
    {
      method: 'GET',
      path: '/shops/mine',
      handler: 'shop.mine',
      config: { auth: {} },
    },
  ],
};
