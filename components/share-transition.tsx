"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Share2, Copy, Twitter, Facebook } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareTransitionProps {
  transition: {
    song1_name: string;
    song1_artist: string;
    song2_name: string;
    song2_artist: string;
  };
  url: string;
}

export default function ShareTransition({ transition, url }: ShareTransitionProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const shareText = `Check out this smooth transition from "${transition.song1_name}" by ${transition.song1_artist} to "${transition.song2_name}" by ${transition.song2_artist} on TransitionFlow!`
  
  const handleCopyLink = async () => {
    setIsLoading(true)
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "The transition link has been copied to your clipboard",
      })
    } catch (error) {
      console.error("Error copying link:", error)
      toast({
        title: "Copy failed",
        description: "There was an error copying the link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink} disabled={isLoading}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter}>
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
