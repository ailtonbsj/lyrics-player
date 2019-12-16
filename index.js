// Lyric Text
var lyricByTime;
var progress;
var display;
var lyricMusic;
function getLyric(url, onReadyCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let lrc = this.responseText;
            lyricByTime = [];
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

    xhttp.open("GET", `lyrics/${url}.lrc`, true);
    xhttp.send();
}

function playWithLyric() {
    player.playVideo();
    //play.innerText = "Pause";
    progress = setInterval(progressVideo, 500);
}

function pauseWithLyric() {
    player.pauseVideo();
    //play.innerText = "Play";
    clearInterval(progress);
}

var lastLine = -1;
function progressVideo() {
    lyricByTime.every(function (line, i) {
        if (line.stamp > (player.getCurrentTime())) {
            if (lastLine != i) {
                display.innerHTML += "<br/>" + line.text;
                lyricMusic.scrollTo(0, display.scrollHeight);
                lastLine = i;
            }
            return false;
        } else return true;
    });
}

function loadNewMusic(videoId, lyricName) {
    pauseWithLyric();
    display.innerHTML = "";
    player.loadVideoById({ 'videoId': videoId });
    pauseWithLyric();
    getLyric(lyricName, function () {
        playWithLyric();
    });
}

function getListOfMusic() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            let list = document.getElementById("list-lyrics");
            data.map(function(item){
                list.innerHTML += `<li onclick="loadNewMusic('${item.id}','${item.lyric}')">${item.lyric}</li>`;
            });
        }
    };

    xhttp.open("GET", "data.json", true);
    xhttp.send();
}

window.onload = function () {
    document.getElementById("player").style.display = "none";
    display = document.getElementById("display");
    lyricMusic = document.getElementById("lyric-music");
    getListOfMusic();
}