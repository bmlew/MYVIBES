import { Switch } from "./ui/switch";

interface FavoriteToggleProps {
  name: string;
  rating: string;
  enabled: boolean;
  onToggle: () => void;
}

export function FavoriteToggle({ name, rating, enabled, onToggle }: FavoriteToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-gray-500">★ {rating}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
