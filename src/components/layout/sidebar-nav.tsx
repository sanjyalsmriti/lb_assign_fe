"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, PlusCircle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/checkpoint-entries", label: "Checkpoint Entries", icon: ClipboardList, exact: false },
  { href: "/checkpoint-entries/new", label: "New Entry", icon: PlusCircle, exact: true },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && pathname !== "/checkpoint-entries/new";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Truck className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">TQMS</p>
          <p className="text-xs text-muted-foreground">Checkpoint</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 p-3">
        <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Checkpoint
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
