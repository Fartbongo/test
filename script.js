import { database, ref, push, onChildAdded } from './firebase-init.js';

$(document).ready(function () { 
    $('.navbar-nav>li>a').on('click', function () {
        $('.navbar-collapse').collapse('hide'); 
    }); 
});

document.addEventListener('DOMContentLoaded', () => {
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

    const messageForm = document.getElementById('messageForm');
    const messagesDiv = document.getElementById('messages');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const message = document.getElementById('message').value;

        push(ref(database, 'messages'), {
            username: username,
            message: message,
            timestamp: Date.now()
        });

        messageForm.reset();
    });

    onChildAdded(ref(database, 'messages'), (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${messageData.username}</strong>: ${messageData.message}`;
        messagesDiv.appendChild(messageElement);
    });
});