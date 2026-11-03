"use client";

import { useState } from "react";
import { Menu, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <p className="hidden text-sm text-muted-foreground lg:block">Truck Queue Management System</p>
          <div className="flex items-center gap-2 text-sm">
            <UserCircle2 className="size-5 text-muted-foreground" />
            <span className="font-medium">Checkpoint User</span>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
