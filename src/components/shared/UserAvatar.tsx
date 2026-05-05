'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { signOutAction } from '@/actions/auth';

interface UserAvatarProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  collapsed?: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserAvatar({ name, email, image, collapsed = false }: UserAvatarProps) {
  const router = useRouter();
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 w-full text-left outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md p-1 -m-1 hover:bg-muted/60 transition-colors">
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={image ?? undefined} alt={name ?? 'User'} />
          <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{name ?? 'User'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{email ?? ''}</p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-48">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <User className="size-3.5" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="size-3.5" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOutAction()}
        >
          <LogOut className="size-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
