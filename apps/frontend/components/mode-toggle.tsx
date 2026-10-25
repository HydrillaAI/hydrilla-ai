"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { switchTheme, type ThemeChoice } from "@/lib/theme-transition"

export function ModeToggle({ className }: { className?: string } = {}) {
  const { setTheme } = useTheme()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // The reveal grows from the toggle the user just pressed.
  const choose = (choice: ThemeChoice) => {
    const rect = triggerRef.current?.getBoundingClientRect()
    switchTheme(setTheme, choice, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" size="icon" className={className ?? "rounded-full"}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => choose("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => choose("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => choose("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
