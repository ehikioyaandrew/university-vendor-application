export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/place',
      handler: 'order.place',
      config: { auth: {} },
    },
    {
      method: 'GET',
      path: '/orders/history',
      handler: 'order.history',
      config: { auth: {} },
    },
    {
      method: 'GET',
      path: '/orders/summary',
      handler: 'order.summary',
      config: { auth: {} },
    },
  ],
};
