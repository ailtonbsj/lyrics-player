// Youtube IFrame API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360', width: '640',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
}

function onPlayerStateChange(event) {
}

// Lyric Text
var lyricByTime = [];
var progress;
function getLyric(url, onReadyCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let lrc = this.responseText;
            lrc.split("\n").map(function (line) {
                let div = line.lastIndexOf(']');
                let command = line.substring(0, div + 1);
                let lyricLine = line.substring(div + 1);
                if (command.length == 10 && command.includes('.')) {
                    let tokenTime = command.substring(1, command.length - 1).split(':');
                    let timeStamp = parseInt(tokenTime[0], 10) * 60 + parseFloat(tokenTime[1]);
                    lyricByTime.push({
                        text: lyricLine,
                        stamp: timeStamp
                    });
                }
            });
            lyricByTime.sort(function (a, b) {
                if (a.stamp > b.stamp) return 1;
                if (a.stamp < b.stamp) return -1;
                return 0;
            });
            onReadyCallback();
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

function playWithLyric() {
    player.playVideo();
    play.innerText = "Pause";
    progress = setInterval(progressVideo, 500);
}

function pauseWithLyric() {
    player.pauseVideo();
    play.innerText = "Play";
    clearInterval(progress);
}

var lastLine = -1;
function progressVideo() {
    lyricByTime.every(function (line, i) {
        if (line.stamp > (player.getCurrentTime()+5)) {
            if (lastLine != i) {
                display.innerHTML += "<br/>" + line.text;
                display.scrollTo(0, display.scrollHeight);
                lastLine = i;
            }
            return false;
        } else return true;
    });
}

var display;
window.onload = function () {
    var play = document.getElementById("play");
    var add = document.getElementById("add");
    display = document.getElementById("display");
    add.onclick = function () {
        player.loadVideoById({ 'videoId': 'E_mU-Z-bKbw' });
        pauseWithLyric();
        getLyric("Evanescence Missing.lrc", function () {
            playWithLyric();
        });
    }
    play.onclick = function () {
        if (play.innerText == "Play") {
            playWithLyric();
        }
        else {
            pauseWithLyric();
        }
    }
    document.getElementById("player").style.display = "none";
}