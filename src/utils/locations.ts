export interface LocationNode {
  region: string;
  state: string;
  district: string;
  cluster: string;
}

/** Known geography from the FY tracker sheet, used for cascading dropdowns. */
export const LOCATION_TREE: LocationNode[] = [
  { region: 'West', state: 'Maharashtra', district: 'Raigad', cluster: 'Karjat' },
  { region: 'West', state: 'Maharashtra', district: 'Palghar', cluster: 'Palghar' },
  { region: 'West', state: 'Maharashtra', district: 'Ratnagiri', cluster: 'Khed' },
  { region: 'North', state: 'Delhi-NCR', district: 'Delhi-NCR', cluster: 'Delhi-NCR' },
  { region: 'South', state: 'Tamilnadu', district: 'Chennai', cluster: 'Gummidipoondi' },
  { region: 'South', state: 'Karnataka', district: 'Bangalore', cluster: 'Anekal' },
];

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function statesForRegion(region: string, extra: LocationNode[] = []): string[] {
  const all = [...LOCATION_TREE, ...extra];
  return uniqueSorted(all.filter((l) => !region || l.region === region).map((l) => l.state));
}

export function districtsFor(region: string, state: string, extra: LocationNode[] = []): string[] {
  const all = [...LOCATION_TREE, ...extra];
  return uniqueSorted(
    all
      .filter((l) => (!region || l.region === region) && (!state || l.state === state))
      .map((l) => l.district),
  );
}

export function clustersFor(
  region: string,
  state: string,
  district: string,
  extra: LocationNode[] = [],
): string[] {
  const all = [...LOCATION_TREE, ...extra];
  return uniqueSorted(
    all
      .filter(
        (l) =>
          (!region || l.region === region) &&
          (!state || l.state === state) &&
          (!district || l.district === district),
      )
      .map((l) => l.cluster),
  );
}

export function monthsForFiscalYear(fiscalYear: string): string[] {
  // Indian FY typically Apr–Mar; sheet sample used July onward for Q1 illustration.
  const [start] = fiscalYear.split('-');
  const y = Number(start) || new Date().getFullYear();
  return [
    `April ${y}`,
    `May ${y}`,
    `June ${y}`,
    `July ${y}`,
    `Aug ${y}`,
    `Sept ${y}`,
    `Oct ${y}`,
    `Nov ${y}`,
    `Dec ${y}`,
    `Jan ${y + 1}`,
    `Feb ${y + 1}`,
    `Mar ${y + 1}`,
  ];
}
