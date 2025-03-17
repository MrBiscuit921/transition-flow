import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Music} from "lucide-react";

export default function TransitionNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6">
      <div className="text-center space-y-4">
        <Music className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Transition Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The transition you're looking for doesn't exist or may have been
          removed.
        </p>
        <Button asChild variant="default" className="mt-4">
          <Link href="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Transitions
          </Link>
        </Button>
      </div>
    </div>
  );
}
