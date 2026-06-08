function initMoviePlayer(source) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var hlsInstance = null;
  var isReady = false;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = source;
    isReady = true;
  }

  function startPlay() {
    attachSource();
    overlay.classList.add('is-hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlay);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
