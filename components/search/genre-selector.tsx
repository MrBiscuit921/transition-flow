"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Genre {
  value: string
  label: string
}

interface GenreSelectorProps {
  selectedGenres: string[]
  setSelectedGenres: (genres: string[]) => void
}

const genres: Genre[] = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop", label: "Hip Hop" },
  { value: "r-and-b", label: "R&B" },
  { value: "electronic", label: "Electronic" },
  { value: "dance", label: "Dance" },
  { value: "indie", label: "Indie" },
  { value: "alternative", label: "Alternative" },
  { value: "metal", label: "Metal" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "country", label: "Country" },
  { value: "folk", label: "Folk" },
  { value: "reggae", label: "Reggae" },
  { value: "blues", label: "Blues" },
]

export function GenreSelector({ selectedGenres, setSelectedGenres }: GenreSelectorProps) {
  const [open, setOpen] = useState(false)

  const toggleGenre = (value: string) => {
    const newSelection = selectedGenres.includes(value)
      ? selectedGenres.filter((g) => g !== value)
      : [...selectedGenres, value]

    setSelectedGenres(newSelection)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedGenres.length > 0
              ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`
              : "Select genres..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search genres..." />
            <CommandList>
              <CommandEmpty>No genre found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {genres.map((genre) => (
                  <CommandItem key={genre.value} value={genre.value} onSelect={() => toggleGenre(genre.value)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedGenres.includes(genre.value) ? "opacity-100" : "opacity-0")}
                    />
                    {genre.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map((value) => {
            const genre = genres.find((g) => g.value === value)
            return (
              <Badge key={value} variant="secondary" className="cursor-pointer" onClick={() => toggleGenre(value)}>
                {genre?.label}
                <span className="ml-1 text-xs">×</span>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

