import fs from 'fs';
const data = JSON.parse(fs.readFileSync('generated_meta.json'));

let sql = '';
data.forEach(d => {
  const high = Object.entries(d.high).map(([k,v]) => k+': '+v).join(' | ');
  const desc = d.desc.replace(/'/g, "''");
  const finalDesc = desc + '\n\nHighlights: ' + high;
  const safeId = d.id.replace(/'/g, "''");
  sql += `UPDATE products SET description = '${finalDesc}' WHERE name = '${safeId}';\n`;
});

fs.writeFileSync('update_products_meta.sql', sql);
console.log('Wrote SQL script! Lines:', data.length);
