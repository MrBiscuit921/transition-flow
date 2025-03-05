// components/spotify-player.tsx
"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Play, Pause, SkipForward, Loader2 } from 'lucide-react'

interface SpotifyPlayerProps {
  firstTrackId: string
  secondTrackId: string
  crossfadeLength: number
}

export default function SpotifyPlayer({ firstTrackId, secondTrackId, crossfadeLength }: SpotifyPlayerProps) {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [player, setPlayer] = useState<Spotify.Player | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<any>(null)

  // Load the Spotify Web Playback SDK
  useEffect(() => {
    if (!session?.provider_token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'TransitionFlow Web Player',
        getOAuthToken: cb => { cb(session.provider_token as string); },
        volume: 0.5
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
        toast({
          title: "Player initialization failed",
          description: message,
          variant: "destructive",
        });
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
        toast({
          title: "Authentication error",
          description: "Please sign in again to use the player",
          variant: "destructive",
        });
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
        toast({
          title: "Premium account required",
          description: "Spotify playback requires a Premium account",
          variant: "destructive",
        });
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
        toast({
          title: "Playback error",
          description: message,
          variant: "destructive",
        });
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsPlayerReady(true);
        toast({
          title: "Player connected",
          description: "Ready to play transitions",
        });
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId(null);
        setIsPlayerReady(false);
      });

      // Connect to the player
      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [session?.provider_token]);

  // Function to play the transition
  const playTransition = async () => {
    if (!deviceId || !session?.provider_token) {
      toast({
        title: "Player not ready",
        description: "Please wait for the player to connect",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, add the second track to the queue
      await fetch(`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${secondTrackId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
      });

      // Then play the first track
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${firstTrackId}`],
        }),
      });

      setIsPlaying(true);

      // Get the track duration
      const trackInfoResponse = await fetch(`https://api.spotify.com/v1/tracks/${firstTrackId}`, {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
        },
      });
      
      const trackInfo = await trackInfoResponse.json();
      const trackDuration = trackInfo.duration_ms;
      
      // Calculate when to skip to near the end (20 seconds before the end)
      const skipToPosition = Math.max(0, trackDuration - (20 * 1000));
      
      // Wait a moment to ensure the track is playing
      setTimeout(async () => {
        // Skip to 20 seconds before the end of the first track
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${skipToPosition}&device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.provider_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        setIsLoading(false);
      }, 1000);
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

  // Function to toggle play/pause
  const togglePlayPause = async () => {
    if (!player) return;
    
    await player.togglePlay();
    setIsPlaying(!isPlaying);
  };

  // Function to skip to the next track
  const skipToNext = async () => {
    if (!session?.provider_token || !deviceId) return;
    
    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error skipping to next track:", error);
    }
  };

  if (!session) {
    return (
      <div className="rounded-md bg-muted p-4 text-center">
        <p>Please sign in to use the player</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Spotify Player</h3>
            <div className="text-sm text-muted-foreground">
              {isPlayerReady ? "Connected" : "Connecting..."}
            </div>
          </div>
          
          {currentTrack && (
            <div className="flex items-center gap-3">
              <img 
                src={currentTrack.album.images[0]?.url || "/placeholder.svg?height=40&width=40"} 
                alt={currentTrack.name}
                className="h-10 w-10 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentTrack.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artists.map((a: any) => a.name).join(", ")}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={!isPlayerReady || isLoading}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              disabled={!isPlayerReady || isLoading}
              onClick={skipToNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button 
              className="ml-4"
              disabled={!isPlayerReady || isLoading}
              onClick={playTransition}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Play Transition</>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Note: This feature requires a Spotify Premium account and works best on desktop browsers.</p>
      </div>
    </div>
  );
}