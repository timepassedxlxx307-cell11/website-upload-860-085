(function () {
  const player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const cover = player.querySelector('[data-play-cover]');
  const button = player.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const playUrl = video.getAttribute('data-play-url');
  let attached = false;
  let hlsInstance = null;

  const attachSource = function () {
    if (attached || !playUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = playUrl;
  };

  const startPlayback = function () {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;
    const result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
