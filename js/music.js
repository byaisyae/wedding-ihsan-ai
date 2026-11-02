// music.js — musik latar. Sumber diatur di config.js (music.source: "file" | "youtube").
(function () {
  "use strict";
  const CFG = window.WEDDING_CONFIG || {};
  const M = CFG.music || {};
  const mode = M.source === "youtube" && M.youtubeId ? "youtube" : "file";

  window.isPlaying = false;
  let ytPlayer = null;
  let ytReady = false;
  let wantPlay = false;

  function audioEl() {
    return document.getElementById("audio-player");
  }

  function setIcon(on) {
    const icon = document.getElementById("audio-icon");
    if (!icon) return;
    if (on) {
      icon.classList.remove("ph-speaker-slash");
      icon.classList.add("animate-spin-slow", "ph-music-notes");
    } else {
      icon.classList.remove("animate-spin-slow", "ph-music-notes");
      icon.classList.add("ph-speaker-slash");
    }
  }

  function play() {
    if (mode === "youtube") {
      if (ytReady && ytPlayer) {
        ytPlayer.unMute();
        ytPlayer.playVideo();
        window.isPlaying = true;
        setIcon(true);
      } else {
        wantPlay = true; // diputar begitu API YouTube siap
      }
      return;
    }
    const a = audioEl();
    if (!a) return;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        window.isPlaying = true;
        setIcon(true);
      }).catch(() => {
        // diblokir browser; user bisa menyalakan lewat tombol audio
        window.isPlaying = false;
        setIcon(false);
      });
    } else {
      window.isPlaying = true;
      setIcon(true);
    }
  }

  function pause() {
    if (mode === "youtube") {
      wantPlay = false;
      if (ytReady && ytPlayer) ytPlayer.pauseVideo();
    } else {
      const a = audioEl();
      if (a) a.pause();
    }
    window.isPlaying = false;
    setIcon(false);
  }

  // Dipanggil dari bukaUndangan() (butuh gesture klik user agar boleh autoplay)
  window.startMusic = play;

  window.toggleAudio = function () {
    if (window.isPlaying) pause();
    else play();
  };

  if (mode === "youtube") {
    // Muat YouTube IFrame API hanya jika memang dipakai
    window.onYouTubeIframeAPIReady = function () {
      ytPlayer = new YT.Player("youtube-player", {
        height: "10",
        width: "10",
        videoId: M.youtubeId,
        playerVars: { controls: 0, loop: 1, playlist: M.youtubeId, playsinline: 1 },
        events: {
          onReady: function () {
            ytReady = true;
            if (wantPlay) play();
          },
        },
      });
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
})();
