import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  height?: string;
  width?: string;
}

export default function YouTubePlayer({ videoId, height = "400", width = "100%" }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<any>(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    };

    const createPlayer = () => {
      if (playerRef.current) {
        ytPlayer.current = new window.YT.Player(playerRef.current, {
          height,
          width,
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              console.log("YouTube Player is ready");
            },
            onError: (e: any) => {
              console.error("YouTube Player error", e);
            },
          },
        });
      }
    };

    // טעינה אם עדיין לא נטען
    if (!window.YT) {
      window.onYouTubeIframeAPIReady = createPlayer;
      loadYouTubeAPI();
    } else {
      createPlayer();
    }

    return () => {
      ytPlayer.current?.destroy();
    };
  }, [videoId, height, width]);

  return <div ref={playerRef} className="w-full rounded-xl shadow-md overflow-hidden" />;
}
