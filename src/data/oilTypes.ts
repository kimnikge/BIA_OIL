export const oilTypes = [
  { brand: 'Shell', types: ['Helix Ultra 0W-40', 'Helix Ultra 5W-40', 'Helix HX8 5W-40'] },
  { brand: 'Mobil', types: ['Mobil 1 0W-40', 'Mobil 1 5W-40', 'Super 3000 5W-40'] },
  { brand: 'Castrol', types: ['EDGE 0W-40', 'EDGE 5W-40', 'Magnatec 5W-40'] },
  { brand: 'Liqui Moly', types: ['Top Tec 0W-40', 'Molygen 5W-40', 'Optimal 10W-40'] },
  { brand: 'Total', types: ['Quartz 9000 5W-40', 'Quartz Ineo 5W-30'] },
  { brand: 'ZIC', types: ['X9 5W-40', 'X7 5W-40', 'X5 10W-40'] }
].sort((a, b) => a.brand.localeCompare(b.brand));
