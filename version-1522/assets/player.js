(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function playVideo(card) {
        var video = card.querySelector("video");
        var message = card.querySelector("[data-player-message]");
        var source = card.getAttribute("data-source");

        if (!video || !source) {
            return;
        }

        if (message) {
            message.textContent = "";
        }

        video.controls = true;
        card.classList.add("is-playing");

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    if (message) {
                        message.textContent = "浏览器阻止了自动播放，请再次点击播放器开始播放。";
                    }
                });
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal && message) {
                    message.textContent = "播放源暂时无法加载，请稍后重试。";
                }
            });
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {
                if (message) {
                    message.textContent = "浏览器阻止了自动播放，请再次点击播放器开始播放。";
                }
            });
            return;
        }

        if (message) {
            message.textContent = "当前浏览器需要支持 HLS，或允许页面联网加载 hls.js 后播放。";
        }
    }

    ready(function () {
        var players = document.querySelectorAll("[data-player]");

        players.forEach(function (card) {
            var button = card.querySelector("[data-player-button]");

            if (button) {
                button.addEventListener("click", function () {
                    playVideo(card);
                });
            }
        });
    });
})();
