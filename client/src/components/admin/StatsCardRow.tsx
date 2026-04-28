export interface Stat {
  label: string;
  value: number | string;
  color?: string;
}

interface Props {
  stats: Stat[];
}

const GRID_CLASSES: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

export default function StatsCardRow({ stats }: Props) {
  const gridClass = GRID_CLASSES[stats.length] ?? 'md:grid-cols-4';
  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <div className={`grid grid-cols-1 ${gridClass} gap-4 text-center`}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={`text-2xl font-bold ${stat.color ?? 'text-gray-900'}`}>{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
