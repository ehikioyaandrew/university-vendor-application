import { SalesBook } from '../../core/models';

function slug(shop: string, label: string) {
  const name = `${shop}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `oja-${name || 'sales'}`;
}

function save(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function xml(value: string | number) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cell(value: string | number, kind: 'String' | 'Number' = 'String') {
  return `<Cell><Data ss:Type="${kind}">${xml(value)}</Data></Cell>`;
}

function row(values: Array<string | number | { value: number }>) {
  const cells = values
    .map((value) => (typeof value === 'object' ? cell(value.value, 'Number') : cell(value)))
    .join('');
  return `<Row>${cells}</Row>`;
}

export function downloadExcel(shop: string, book: SalesBook) {
  const summary = [
    row(['Shop', shop]),
    row(['Period', book.label]),
    row(['Dates', book.span]),
    row(['Made (NGN)', { value: book.made }]),
    row(['Cash (NGN)', { value: book.cash }]),
    row(['Transfer (NGN)', { value: book.transfer }]),
    row(['Not tagged (NGN)', { value: book.unmarked }]),
    row(['Still owing (NGN)', { value: book.owing }]),
    row(['Sales', { value: book.salesCount }]),
  ].join('');
  const items = [
    row(['Item', 'Quantity', 'Amount (NGN)']),
    ...book.items.map((item) => row([item.name, { value: item.quantity }, { value: item.amount }])),
  ].join('');
  const sales = [
    row(['When', 'Buyer', 'Item', 'Quantity', 'Amount (NGN)', 'Payment', 'Status']),
    ...book.sales.map((sale) =>
      row([
        sale.at,
        sale.buyerName,
        sale.item,
        { value: sale.quantity },
        { value: sale.amount },
        sale.paymentMethod ?? '',
        sale.status,
      ]),
    ),
  ].join('');
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Summary"><Table>${summary}</Table></Worksheet>
<Worksheet ss:Name="What sold"><Table>${items}</Table></Worksheet>
<Worksheet ss:Name="Sales"><Table>${sales}</Table></Worksheet>
</Workbook>`;
  save(`${slug(shop, book.label)}.xls`, new Blob([workbook], { type: 'application/vnd.ms-excel' }));
}

function ascii(value: string) {
  return value.replace(/[^\x20-\x7E]/g, '').replace(/[()\\]/g, ' ');
}

function pdfBytes(pages: string[][]) {
  const streams = pages.map((lines) => {
    const body = lines
      .map((line, index) => {
        const size = index === 0 ? 16 : 10;
        const y = 800 - index * 16;
        return `/F1 ${size} Tf\n1 0 0 1 40 ${y} Tm\n(${ascii(line)}) Tj`;
      })
      .join('\n');
    return `BT\n${body}\nET\n`;
  });
  const pageCount = streams.length;
  let next = 4;
  const contentIds: number[] = [];
  const pageIds: number[] = [];
  for (let i = 0; i < pageCount; i += 1) {
    contentIds.push(next);
    next += 1;
    pageIds.push(next);
    next += 1;
  }
  const objects: string[] = [];
  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = `2 0 obj\n<< /Type /Pages /Count ${pageCount} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>\nendobj\n`;
  objects[3] = '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  streams.forEach((stream, index) => {
    objects[contentIds[index]] = `${contentIds[index]} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`;
    objects[pageIds[index]] =
      `${pageIds[index]} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentIds[index]} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n`;
  });
  let out = '%PDF-1.4\n';
  const xref = [0];
  for (let id = 1; id < next; id += 1) {
    xref[id] = out.length;
    out += objects[id];
  }
  const start = out.length;
  out += `xref\n0 ${next}\n0000000000 65535 f \n`;
  for (let id = 1; id < next; id += 1) {
    out += `${String(xref[id]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${next} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return new TextEncoder().encode(out);
}

export function downloadPdf(shop: string, book: SalesBook) {
  const lines = [
    `${shop}  ${book.label}`,
    book.span,
    '',
    `Made          NGN ${book.made.toLocaleString('en-NG')}`,
    `Cash          NGN ${book.cash.toLocaleString('en-NG')}`,
    `Transfer      NGN ${book.transfer.toLocaleString('en-NG')}`,
    `Not tagged    NGN ${book.unmarked.toLocaleString('en-NG')}`,
    `Still owing   NGN ${book.owing.toLocaleString('en-NG')}`,
    `Sales         ${book.salesCount}`,
    '',
    'What sold',
    ...book.items.map((item) => `${item.quantity} x ${item.name}    NGN ${item.amount.toLocaleString('en-NG')}`),
    '',
    'Each sale',
    ...book.sales.map(
      (sale) =>
        `${sale.buyerName}  ${sale.item}  x${sale.quantity}  NGN ${sale.amount.toLocaleString('en-NG')}  ${sale.paymentMethod || sale.status}`,
    ),
  ];
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 42) pages.push(lines.slice(index, index + 42));
  if (pages.length === 0) pages.push([shop, 'No sales in this period']);
  const bytes = pdfBytes(pages);
  save(`${slug(shop, book.label)}.pdf`, new Blob([bytes], { type: 'application/pdf' }));
}
