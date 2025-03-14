"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Slider} from "@/components/ui/slider";
import {Search, SlidersHorizontal} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {GenreSelector} from "@/components/search/genre-selector";

export default function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) || []
  );
  const [bpmRange, setBpmRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("bpmMin") || "80"),
    Number.parseInt(searchParams.get("bpmMax") || "160"),
  ]);
  const [energyLevel, setEnergyLevel] = useState<number>(
    Number.parseInt(searchParams.get("energy") || "50")
  );
  const [danceability, setDanceability] = useState<number>(
    Number.parseInt(searchParams.get("danceability") || "50")
  );

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("q", searchTerm);
    if (selectedGenres.length > 0)
      params.set("genres", selectedGenres.join(","));
    params.set("bpmMin", bpmRange[0].toString());
    params.set("bpmMax", bpmRange[1].toString());
    params.set("energy", energyLevel.toString());
    params.set("danceability", danceability.toString());

    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by song or artist..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Advanced filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Search</SheetTitle>
              <SheetDescription>
                Fine-tune your search with musical attributes
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label>Genres</Label>
                <GenreSelector
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>BPM Range</Label>
                  <span className="text-sm text-muted-foreground">
                    {bpmRange[0]} - {bpmRange[1]}
                  </span>
                </div>
                <Slider
                  min={60}
                  max={200}
                  step={1}
                  value={bpmRange}
                  onValueChange={(value) =>
                    setBpmRange(value as [number, number])
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Energy Level</Label>
                  <span className="text-sm text-muted-foreground">
                    {energyLevel}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[energyLevel]}
                  onValueChange={(value) => setEnergyLevel(value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Danceability</Label>
                  <span className="text-sm text-muted-foreground">
                    {danceability}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[danceability]}
                  onValueChange={(value) => setDanceability(value[0])}
                />
              </div>

              <Button className="w-full" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
}
