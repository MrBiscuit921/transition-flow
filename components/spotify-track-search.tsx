// components/spotify-track-search.tsx
"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
}

interface SpotifyTrackSearchProps {
  onSelectTrack: string;
  onCancel: string;
}

export default function SpotifyTrackSearch({ onSelectTrack, onCancel }: SpotifyTrackSearchProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const searchTracks = async () => {
    if (!query.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`)
      
      if (response.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please sign in with Spotify to search for tracks",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to search tracks")
      }
      
      const data = await response.json()
      setResults(data.tracks?.items || [])
    } catch (error) {
      console.error("Error searching tracks:", error)
      toast({
        title: "Search failed",
        description: "There was an error searching for tracks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchTracks()
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSelectTrack = (track: SpotifyTrack) => {
    // Store the selected track in localStorage
    localStorage.setItem(onSelectTrack, JSON.stringify(track))
    
    // Trigger a custom event that the parent component can listen for
    const event = new CustomEvent('trackSelected', { 
      detail: { trackKey: onSelectTrack, track } 
    })
    window.dispatchEvent(event)
  }

  const handleCancel = () => {
    // Trigger a custom event for cancellation
    const event = new CustomEvent('searchCancelled', { 
      detail: { action: onCancel } 
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Search for a track</h2>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by song or artist..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-2 max-h-[400px] overflow-y-auto">
          {results.map((track) => (
            <Card 
              key={track.id} 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSelectTrack(track)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url || "/placeholder.svg"}
                    alt={track.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map((a: any) => a.name).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tracks found. Try a different search.</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Start typing to search for tracks</p>
        </div>
      )}
    </div>
  )
}