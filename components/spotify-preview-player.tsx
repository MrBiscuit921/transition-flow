// components/spotify-preview-player.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Play, Pause, SkipForward, Loader2 } from 'lucide-react'

interface SpotifyPreviewPlayerProps {
  firstTrackId: string
  secondTrackId: string
  crossfadeLength: number
}

export default function SpotifyPreviewPlayer({ firstTrackId, secondTrackId, crossfadeLength }: SpotifyPreviewPlayerProps) {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<'first' | 'second' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Function to play the first track
  const playFirstTrack = () => {
    if (currentTrack === 'first') {
      // Toggle play/pause if already on first track
      const iframe = document.getElementById('first-track-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: isPlaying ? 'pause' : 'play' }, '*');
        setIsPlaying(!isPlaying);
      }
    } else {
      // Switch to first track
      setCurrentTrack('first');
      setIsPlaying(true);
    }
  };

  // Function to play the second track
  const playSecondTrack = () => {
    if (currentTrack === 'second') {
      // Toggle play/pause if already on second track
      const iframe = document.getElementById('second-track-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: isPlaying ? 'pause' : 'play' }, '*');
        setIsPlaying(!isPlaying);
      }
    } else {
      // Switch to second track
      setCurrentTrack('second');
      setIsPlaying(true);
    }
  };

  // Function to simulate the transition (play first track, then second)
  const playTransition = async () => {
    setIsLoading(true);
    
    try {
      // First play the first track
      setCurrentTrack('first');
      setIsPlaying(true);
      
      // After a few seconds, switch to the second track
      setTimeout(() => {
        setCurrentTrack('second');
        setIsLoading(false);
      }, 5000); // Switch after 5 seconds to simulate transition
    } catch (error) {
      console.error("Error playing transition:", error);
      toast({
        title: "Playback failed",
        description: "There was an error playing the transition",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview Transition</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-md border p-2 ${currentTrack === 'first' ? 'ring-2 ring-primary' : ''}`}>
              <div className="text-sm font-medium mb-2">First Track</div>
              <div className="aspect-video bg-black">
                <iframe
                  id="first-track-iframe"
                  src={`https://open.spotify.com/embed/track/${firstTrackId}?utm_source=generator`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: currentTrack === 'first' ? 'block' : 'none' }}
                ></iframe>
              </div>
              <Button 
                className="w-full mt-2" 
                size="sm"
                onClick={playFirstTrack}
              >
                {currentTrack === 'first' && isPlaying ? (
                  <><Pause className="mr-2 h-4 w-4" /> Pause</>
                ) : (
                  <><Play className="mr-2 h-4 w-4" /> Play</>
                )}
              </Button>
            </div>
            
            <div className={`rounded-md border p-2 ${currentTrack === 'second' ? 'ring-2 ring-primary' : ''}`}>
              <div className="text-sm font-medium mb-2">Second Track</div>
              <div className="aspect-video bg-black">
                <iframe
                  id="second-track-iframe"
                  src={`https://open.spotify.com/embed/track/${secondTrackId}?utm_source=generator`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: currentTrack === 'second' ? 'block' : 'none' }}
                ></iframe>
              </div>
              <Button 
                className="w-full mt-2" 
                size="sm"
                onClick={playSecondTrack}
              >
                {currentTrack === 'second' && isPlaying ? (
                  <><Pause className="mr-2 h-4 w-4" /> Pause</>
                ) : (
                  <><Play className="mr-2 h-4 w-4" /> Play</>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              disabled={isLoading}
              onClick={playTransition}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transitioning...
                </>
              ) : (
                <>Simulate Transition</>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Note: This preview player provides 30-second samples of each track. For the full experience with automatic crossfade, open these tracks in the Spotify app.</p>
      </div>
    </div>
  );
}