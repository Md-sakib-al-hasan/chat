type SupportedOperators = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gte' | 'lte' | 'gt' | 'lt' | 'in';

const operatorMap: Record<string, SupportedOperators> = {
  equals: 'equals',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  gte: 'gte',
  lte: 'lte',
  gt: 'gt',
  lt: 'lt',
  in: 'in',
};

function parseKey(key: string): { field: string; op: SupportedOperators } {
  const parts = key.split('_');
  const opSuffix = parts.pop()!;
  const field = parts.join('_');

  if (operatorMap[opSuffix]) {
    return { field, op: operatorMap[opSuffix] };
  }
  return { field: key, op: 'contains' }; 
}

export const buildDynamicPrismaFilter = <T = any>(dto: Record<string, any>): Record<string, any> => {
  const filter: Record<string, any> = {};
  const excludedFields = ['createdAt', 'updatedAt'];

  for (const rawKey in dto) {
    const value = dto[rawKey];
    if (value === undefined || value === null || value === '') continue;

    const { field, op } = parseKey(rawKey);

    
    if (excludedFields.includes(field)) continue;

    if (!filter[field]) filter[field] = {};

    if (op === 'in' && typeof value === 'string') {
      filter[field][op] = value.split(',').map(v => v.trim());
    } else {
      filter[field][op] = value;
    }
  }

  return filter;
};
