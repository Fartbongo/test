document.addEventListener('DOMContentLoaded', () => {
    // jQuery code
    $('.navbar-nav>li>a').on('click', function () {
        $('.navbar-collapse').collapse('hide'); 
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
});