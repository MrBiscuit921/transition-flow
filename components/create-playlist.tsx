"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Music, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface Transition {
  id: string;
  song1_id: string;
  song2_id: string;
  song1_name: string;
  song2_name: string;
}

interface CreatePlaylistProps {
  transitions: Transition[];
}

export default function CreatePlaylist({ transitions }: CreatePlaylistProps) {
  const { session } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [playlistName, setPlaylistName] = useState("My TransitionFlow Playlist")
  const [playlistDescription, setPlaylistDescription] = useState("Seamless transitions created with TransitionFlow")
  const [selectedTransitions, setSelectedTransitions] = useState<Record<string, boolean>>({})
  const [isPublic, setIsPublic] = useState(true)

  const handleCreatePlaylist = async () => {
    if (!session?.provider_token) {
      toast({
        title: "Authentication required",
        description: "Please sign in with Spotify to create playlists",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get selected transitions
      const transitionsToAdd = transitions.filter(t => selectedTransitions[t.id])
      
      if (transitionsToAdd.length === 0) {
        toast({
          title: "No transitions selected",
          description: "Please select at least one transition to add to your playlist",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create a new playlist
      const createResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          public: isPublic
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create playlist')
      }

      const playlist = await createResponse.json()

      // Get all track URIs in order
      const trackUris: string[] = []
      transitionsToAdd.forEach(transition => {
        trackUris.push(`spotify:track:${transition.song1_id}`)
        trackUris.push(`spotify:track:${transition.song2_id}`)
      })

      // Add tracks to the playlist
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris
        }),
      })

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist')
      }

      toast({
        title: "Playlist created!",
        description: "Your playlist has been created and added to your Spotify account",
      })

      // Open the playlist in Spotify
      window.open(playlist.external_urls.spotify, '_blank')
    } catch (error) {
      console.error('Error creating playlist:', error)
      toast({
        title: "Failed to create playlist",
        description: "There was an error creating your playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTransition = (id: string) => {
    setSelectedTransitions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Spotify Playlist</DialogTitle>
          <DialogDescription>
            Create a playlist with your selected transitions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="playlist-name" className="text-sm font-medium">
              Playlist Name
            </label>
            <Input
              id="playlist-name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="playlist-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="playlist-description"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={isPublic}
              onCheckedChange={() => setIsPublic(!isPublic)}
            />
            <label htmlFor="public" className="text-sm font-medium">
              Make playlist public
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Transitions</label>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {transitions.map(transition => (
                <div key={transition.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`transition-${transition.id}`}
                    checked={!!selectedTransitions[transition.id]}
                    onCheckedChange={() => toggleTransition(transition.id)}
                  />
                  <label htmlFor={`transition-${transition.id}`} className="text-sm">
                    {transition.song1_name} → {transition.song2_name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreatePlaylist} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Create Playlist
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
