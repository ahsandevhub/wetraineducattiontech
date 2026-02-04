"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type Team = {
  name: string;
  logo: string;
  domain: string;
};

const teams: Team[] = [
  {
    name: "WeTrain",
    logo: "WT",
    domain: "https://wetraineducation.com",
  },
  {
    name: "WeSend",
    logo: "We",
    domain: "https://wesend.wetraineducation.com",
  },
  {
    name: "LeadPilot",
    logo: "LP",
    domain: "https://leadpilot.wetraineducation.com",
  },
];

export function TeamSwitcher() {
  const [activeTeam] = useState<Team>(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-black text-white font-semibold">
                {activeTeam.logo}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{activeTeam.name}</span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg"
            align="start"
            side="right"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team) => (
              <button
                key={team.name}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => (window.location.href = team.domain)}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-black text-white font-semibold text-sm">
                  {team.logo}
                </div>
                <div className="flex flex-col gap-0.5 leading-none text-left truncate">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {team.domain}
                  </span>
                </div>
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
