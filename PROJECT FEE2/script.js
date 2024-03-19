let currentSong = new Audio();
let songs;
let currentFolder;

async function getSongs(folder) {
    currentFolder = folder;

    let a = await fetch(`/${folder}/`)

    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    // Show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> 
                <img class="invert" src="/images/music.svg" alt="">
                <div class="info">
                    <div> ${song.replaceAll("%20", " ")}</div>
                </div>
                <div class="playSong flex">
                  <span>Play Now</span>
                  <img class="invert" src="/images/play.svg" alt="">
                </div>
        </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(ele => {
        ele.addEventListener("click", element => {
            playSong(ele.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs 
}

function getTime(time) {
    if (isNaN(time) || time < 0) {
        return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const remainingSeconds = Math.floor(time % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playSong = (song, pause = false) => {
    currentSong.src = `/${currentFolder}/` + song
    if (!pause) {
        currentSong.play()
        play.src = "/images/pause.svg"
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(song)
    document.querySelector(".songDuration").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch('/songs/');
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")
    let playlistContainer = document.querySelector(".playlistContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            playlistContainer.innerHTML = playlistContainer.innerHTML + 
            `<div data-folder="${folder}" class="playlist">

            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
        }
    }

    // Load the playlist whenever playlist is clicked
    Array.from(document.getElementsByClassName("playlist")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playSong(songs[0])
        })
    })
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/Eminem")
    playSong(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/images/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerHTML = `${getTime(currentSong.currentTime)} / ${getTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

     // Add an event listener to seek bar
    document.querySelector(".seekBar").addEventListener("click", ele => {
        document.querySelector(".circle").style.left = (ele.offsetX / ele.target.getBoundingClientRect().width) * 100 + "%"
        currentSong.currentTime = currentSong.duration * (ele.offsetX / ele.target.getBoundingClientRect().width)
    })

    // Add an event listener for mobile Button
    document.querySelector(".mobileButton").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    // Add an event listener for close button
    document.querySelector(".closeButton").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })

    // Add an event listener to play previous song
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (currentIndex - 1 >= 0) playSong(songs[currentIndex - 1]);
    })

    // Add an event listener to play next song
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (currentIndex + 1 < songs.length) playSong(songs[currentIndex + 1]);
    })

    // Add an event to adjust volume
    document.querySelector(".volumeControl").getElementsByTagName("input")[0].addEventListener("change", (vol) => {
        currentSong.volume = parseInt(vol.target.value) / 100
    })

    // Add an event listener to mute the song
    document.querySelector(".volumeButton > img").addEventListener("click", ele => {
        if (ele.target.src.includes("volume.svg")) {
            ele.target.src = ele.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volumeControl").getElementsByTagName("input")[0].value = 0
        } 
        else {
            ele.target.src = ele.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.2;
            document.querySelector(".volumeControl").getElementsByTagName("input")[0].value = 20
        }
    });    
}

main()