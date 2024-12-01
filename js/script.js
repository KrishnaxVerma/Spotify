console.log('Let\'s write JavaScript');
let songs;
let currentFolder;
let currentSong = new Audio();

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    seconds = Math.floor(seconds)
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
}

async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`/${folder}/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currentFolder}/`)[1]);
        }
    }

    //Show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    let htmlToAdd = "";

    for (const song of songs) {
        let html = `<li>
        <img src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>-Singer</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img src="img/play.svg" alt="">
        </div>
    </li>`;

        htmlToAdd += html;
    }

    songUL.innerHTML += htmlToAdd;
}

const playMusic = (track, pause = false) => {

    currentSong.src = `/${currentFolder}/` + track

    if (!pause) {
        play.src = "img/pause.svg"
        currentSong.play()
    }

    // document.querySelector(".songinfo").innerHTML= track.split(".mp3")[0]    
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split(".mp3")[0])
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {

    let response = await fetch(`/songs/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes(".htaaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="black"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }

        //Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log("Fetching Songs")
                await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])

            })
        })
    }

}

async function main() {

    //Get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    //Attach event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = percent / 100 * (currentSong.duration)
    })

    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //Add an event listener to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/")[5])
        if (index == 0) {
            index = songs.length - 1
        }
        else {
            index = index - 1
        }
        playMusic(songs[index])
    })

    //Add an event listener to next button
    next.addEventListener("click", () => {
        console.log("Clicked")
        let index = songs.indexOf(currentSong.src.split("/")[5])
        if (index >= songs.length - 1) {
            index = 0
        }
        else {
            index = index + 1
        }
        playMusic(songs[index])
    })

    //Add an event listener to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src= document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
            console.log("Volume 0")
        }
        else {
            currentSong.volume = 0.1
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
            console.log("Volume 10")
        }
    })

}

main()