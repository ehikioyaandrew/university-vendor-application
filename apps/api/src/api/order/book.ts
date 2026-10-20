export type SalesRange = 'day' | 'week' | 'month';

export interface BookOrder {
  buyerName: string;
  amount: number;
  status: string;
  paymentMethod?: 'cash' | 'transfer' | null;
  quantity?: number | null;
  paidAt?: string | number | Date | null;
  createdAt?: string | number | Date | null;
  product?: { name?: string | null } | null;
}

const LABELS: Record<SalesRange, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function lagosParts(date: Date) {
  const bag: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)) {
    bag[part.type] = part.value;
  }
  return bag;
}

function lagosMidnight(year: number, month: number, day: number) {
  return Date.parse(`${year}-${pad(month)}-${pad(day)}T00:00:00+01:00`);
}

export function rangeStart(range: SalesRange, now = new Date()) {
  const bag = lagosParts(now);
  const year = Number(bag.year);
  const month = Number(bag.month);
  const day = Number(bag.day);
  if (range === 'month') return lagosMidnight(year, month, 1);
  if (range === 'week') {
    const offset = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[bag.weekday] ?? 0;
    const shifted = new Date(lagosMidnight(year, month, day) - offset * 86400000);
    const again = lagosParts(shifted);
    return lagosMidnight(Number(again.year), Number(again.month), Number(again.day));
  }
  return lagosMidnight(year, month, day);
}

function millis(value?: string | number | Date | null) {
  if (!value) return NaN;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return Date.parse(value);
}

function pretty(ms: number) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms));
}

function received(order: BookOrder) {
  return order.status === 'paid' || order.status === 'collected';
}

export function buildBook(orders: BookOrder[], range: SalesRange, now = new Date()) {
  const start = rangeStart(range, now);
  const end = now.getTime();
  const inPeriod = orders.filter((order) => {
    if (order.status === 'cancelled') return false;
    const when = received(order) ? millis(order.paidAt) || millis(order.createdAt) : millis(order.createdAt);
    return when >= start && when <= end;
  });
  const taken = inPeriod.filter(received);
  const sum = (rows: BookOrder[]) => rows.reduce((total, order) => total + Number(order.amount || 0), 0);
  const cashRows = taken.filter((order) => order.paymentMethod === 'cash');
  const transferRows = taken.filter((order) => order.paymentMethod === 'transfer');
  const made = sum(taken);
  const cash = sum(cashRows);
  const transfer = sum(transferRows);
  const owing = sum(orders.filter((order) => order.status === 'owed'));
  const items = new Map<string, { name: string; quantity: number; amount: number }>();
  for (const order of taken) {
    const name = order.product?.name || 'Custom sale';
    const current = items.get(name) ?? { name, quantity: 0, amount: 0 };
    current.quantity += Number(order.quantity || 1);
    current.amount += Number(order.amount || 0);
    items.set(name, current);
  }
  const sales = [...inPeriod].sort((a, b) => {
    const left = millis(a.paidAt) || millis(a.createdAt);
    const right = millis(b.paidAt) || millis(b.createdAt);
    return right - left;
  });

  return {
    range,
    label: LABELS[range],
    span: range === 'day' ? pretty(start) : `${pretty(start)} – ${pretty(end)}`,
    from: new Date(start).toISOString(),
    asOf: now.toISOString(),
    made,
    cash,
    transfer,
    unmarked: made - cash - transfer,
    owing,
    salesCount: taken.length,
    items: [...items.values()].sort((a, b) => b.amount - a.amount),
    sales: sales.map((order) => ({
      at: new Date(millis(order.paidAt) || millis(order.createdAt)).toISOString(),
      buyerName: order.buyerName,
      item: order.product?.name || 'Custom sale',
      quantity: Number(order.quantity || 1),
      amount: Number(order.amount || 0),
      paymentMethod: order.paymentMethod ?? null,
      status: order.status,
    })),
  };
}
