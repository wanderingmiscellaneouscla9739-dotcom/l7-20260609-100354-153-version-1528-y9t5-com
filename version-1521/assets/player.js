(function () {
    window.setupMoviePlayer = function (options) {
        var root = document.getElementById(options.rootId);
        if (!root) {
            return;
        }

        var video = root.querySelector('video');
        var button = root.querySelector('.player-cover');
        var hlsInstance = null;
        var attached = false;

        function attach() {
            if (attached || !video || !options.source) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = options.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(options.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = options.source;
            }
        }

        function start() {
            attach();
            if (button) {
                button.classList.add('hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('hidden');
                }
            });
        }

        root.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                start();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
