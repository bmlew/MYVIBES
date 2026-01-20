import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-amber-500 text-white px-3 py-2 rounded-full shadow-lg animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span className="text-xs font-semibold">Offline Mode</span>
    </div>
  );
}

export function OnlineStatusBadge() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-400" />
      ) : (
        <WifiOff className="w-4 h-4 text-amber-400" />
      )}
    </div>
  );
}
