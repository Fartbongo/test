document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
    // jQuery code
    $('.navbar-nav>li>a').on('click', function () {
        $('.navbar-collapse').collapse('hide'); // Collapse the navbar menu after clicking on a menu item
    });

    // Plain JavaScript code
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const frequencies = {
        'C4': 261.63,
        'D4': 293.66,
        'E4': 329.63,
        'F4': 349.23,
        'G4': 392.00,
        'A4': 440.00,
        'B4': 493.88
    };

    function playTone(frequency, waveform, attack) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = waveform;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + attack);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1); // Play tone for 1 second
    }

    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.addEventListener('click', () => {
            const note = key.dataset.note;
            const frequency = frequencies[note];
            const waveform = document.getElementById('waveform').value;
            const attack = parseFloat(document.getElementById('attack').value);
            playTone(frequency, waveform, attack);
        });
    });

    // Single
    const audioPlayerSingle = document.getElementById('audioPlayerSingle');
    const audioSourceSingle = document.getElementById('audioSourceSingle');
    const currentTrackTitleSingle = document.getElementById('currentTrackTitleSingle');

    // Album
    const audioPlayerAlbum = document.getElementById('audioPlayerAlbum');
    const audioSourceAlbum = document.getElementById('audioSourceAlbum');
    const prevTrackButton = document.getElementById('prevTrack');
    const nextTrackButton = document.getElementById('nextTrack');
    const currentTrackTitleAlbum = document.getElementById('currentTrackTitleAlbum');
    const playlistElement = document.getElementById('playlist');

    const playlist = [
        { title: 'Life', src: 'Life.wav' },
        { title: 'Bacon and Eggs', src: 'bacon and eggs.wav' },
        { title: 'Fuck Yea', src: 'fuck yea.wav' },
        { title: 'Next', src: 'next.wav' },
        { title: 'Natural', src: 'natural.wav' },
        { title: 'Cleaner', src: 'cleaner.wav' },
        { title: 'Jameos', src: 'jameos.wav' },
        { title: 'RSA', src: 'RSA.wav' },
        { title: 'Free Punk', src: 'free punk.wav' }
    ];

    let currentTrackIndex = 0;

    function loadTrack(index) {
        audioSourceAlbum.src = playlist[index].src;
        currentTrackTitleAlbum.textContent = `Now Playing: ${playlist[index].title}`;
        audioPlayerAlbum.load();
        updatePlaylistHighlight();
    }

    function updatePlaylistHighlight() {
        const playlistItems = document.querySelectorAll('#playlist li');
        playlistItems.forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    audioPlayerAlbum.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    prevTrackButton.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    nextTrackButton.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    // Display the playlist
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = track.title;
        li.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
        });
        playlistElement.appendChild(li);
    });

    loadTrack(currentTrackIndex);

    // Add event listeners for carousel controls
    const carousel = document.getElementById('photoCarousel');
    if (carousel) {
        const prevButton = carousel.querySelector('.carousel-control-prev');
        const nextButton = carousel.querySelector('.carousel-control-next');
        
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Your carousel previous logic
        });
        
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Your carousel next logic
        });
    }
});