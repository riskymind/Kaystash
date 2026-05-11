'use client';

import { File, Image, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  file: { label: 'Files', icon: File, color: '#6b7280' },
  image: { label: 'Images', icon: Image, color: '#ec4899' },
};

interface ProUpgradeGateProps {
  typeName: string;
}

export function ProUpgradeGate({ typeName }: ProUpgradeGateProps) {
  const meta = TYPE_META[typeName];
  const Icon = meta?.icon ?? File;
  const label = meta?.label ?? typeName;
  const color = meta?.color ?? '#6b7280';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">{label}</h1>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-border bg-card p-14 text-center gap-6">
        <div className="relative">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-8 w-8" style={{ color }} />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">{label} are a Pro feature</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upgrade to Pro to upload and manage {label.toLowerCase()} alongside your other items.
          </p>
        </div>

        <Button onClick={() => (window.location.href = '/settings?tab=billing')}>
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}
