//dependent on Howler.js https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js

const ComfyJazz = (options = {}) => {
    const cj = {...defaultOptions, ...options};

    /////////////////////
    //ComfyJazz Methods

    cj.setVolume = (vol) => {
        cj.volume = vol;

        if (cj.backgroundSound) {
            cj.backgroundSound.volume(vol);
        }
        if (cj.lastSound) {
            cj.lastSound.volume(vol);
        }
    };

    cj.mute = () => cj.setVolume(0);
    cj.unmute = () => cj.setVolume(1);
    cj.isMuted = () => cj.volume <= 0;
    cj.start = () => startComfyJazz();

    cj.playNoteProgression = playNoteProgression;
    cj.playNote = playNoteRandomly;

    /////////////////////

    // Store previous notes for melodic contour
    const recentNotes = [];
    const MAX_RECENT_NOTES = 5;

    // Track phrase state for breathing space
    let phraseState = {
        notesPlayed: 0,
        inBreathingSpace: false,
        breathingSpaceEndTime: 0
    };

    async function startComfyJazz() {
        let startTime = performance.now();

        //initial start of the background music
        playBackgroundSound(
            `${cj.soundFolder}/${cj.backgroundLoopUrl}`,
            cj.volume,
            1
        ); //1.0594630943592953

        //this will Automatically play a note and then call itself again after a delay
        const AutomaticPlayNote = async () => {
            let currentTime = (performance.now() - startTime) / 1000;

            if (currentTime > cj.backgroundLoopDuration) {
                startTime = performance.now();
                currentTime = 0;

                // play the background music again
                playBackgroundSound(
                    `${cj.soundFolder}/${cj.backgroundLoopUrl}`,
                    cj.volume,
                    1
                );
            }

            for (let i = 0; i < scaleProgressions.length; i++) {
                if (
                    scaleProgressions[i].start <= currentTime &&
                    currentTime <= scaleProgressions[i].end
                ) {
                    currentScaleProgression = i;
                    break;
                }
            }

            // Add breathing space between phrases
            const currentTimeMs = performance.now();
            if (phraseState.inBreathingSpace) {
                if (currentTimeMs >= phraseState.breathingSpaceEndTime) {
                    phraseState.inBreathingSpace = false;
                    phraseState.notesPlayed = 0;
                }
            } else {
                // Check if we should start a breathing space after playing several notes
                if (phraseState.notesPlayed >= 3 + Math.floor(Math.random() * 4)) { // 3-6 notes per phrase
                    phraseState.inBreathingSpace = true;
                    // Breathing space duration between 800-2000ms
                    const breathingDuration = 800 + Math.floor(Math.random() * 1200);
                    phraseState.breathingSpaceEndTime = currentTimeMs + breathingDuration;
                } else if (cj.playAutoNotes && Math.random() < cj.autoNotesChance && !phraseState.inBreathingSpace) {
                    // Only play notes when not in breathing space
                    playNoteRandomly(0, 200);
                    phraseState.notesPlayed++;
                }
            }

            //here's what will loop
            setTimeout(AutomaticPlayNote, cj.autoNotesDelay);
        };

        //start the Automatic Note Player loop
        AutomaticPlayNote();
    }

    //Play a note with possible random delay and swing feel
    async function playNoteRandomly(minRandom = 0, maxRandom = 200) {
        // Add swing feel - delay notes that fall on off-beats
        const swingFactor = (phraseState.notesPlayed % 2 === 1) ? (15 + Math.random() * 25) : 0;
        
        setTimeout(async () => {
            let sound = getNextNote();
            const instruments = cj.instrument.split(",").map((x) => x.trim());
            let instrument = instruments[getRandomInt(instruments.length)];
            
            // Add velocity variation based on melodic position
            // Notes at the start of a phrase or high points are louder
            let noteVolume = cj.volume;
            if (phraseState.notesPlayed === 0 || isLocalPeak(sound.midiNote)) {
                // Emphasize phrase beginnings and peaks (10-15% louder)
                noteVolume = Math.min(1.0, noteVolume * (1.1 + Math.random() * 0.05));
            } else if (phraseState.notesPlayed > 0 && phraseState.notesPlayed % 4 === 3) {
                // De-emphasize certain positions (5-15% softer)
                noteVolume = noteVolume * (0.85 + Math.random() * 0.1);
            }
            
            await playSound(
                `${cj.soundFolder}/${instrument}/${sound.url}.ogg`,
                noteVolume,
                sound.playbackRate
            );
        }, minRandom + Math.random() * maxRandom + swingFactor);
    }

    // Check if a note is a local peak in the melodic contour
    function isLocalPeak(midiNote) {
        if (recentNotes.length < 2) return false;
        
        // Note is higher than both the previous and next notes
        return midiNote > recentNotes[recentNotes.length - 1] && 
               midiNote > recentNotes[recentNotes.length - 2];
    }

    // Play a progression of notes, with random delay spacing!
    function playNoteProgression(numNotes) {
        if (numNotes == null) {
            numNotes = (Math.random() * 8) >> 0;
        }

        // Reset phrase state for a new progression
        phraseState.notesPlayed = 0;
        phraseState.inBreathingSpace = false;

        for (let i = 0; i < numNotes; i++) {
            playNoteRandomly(100, 200 * i);
        }
        return numNotes;
    }

    ////////////////////////////////
    // The fancy music playing functions
    ////////////////////////////////

    function semitonesToPlaybackRate(t) {
        var e = Math.pow(2, 1 / 12);
        return Math.pow(e, t);
    }

    function shiftSource(tone, startRange, endRange) {
        let a = startRange,
            u = endRange,
            c = new WeakMap();

        // var e = c.get( tone );
        // if( e ) return e;
        let n = a + Math.random() * (u - a);
        // c.set( tone, n );
        return n;
    }

    function playBackgroundSound(url, volume = 1, rate = 1) {
        return new Promise((resolve, reject) => {
            let a = new Howl({
                src: [url],
                volume: volume,
                onend: function () {
                    resolve();
                },
            });
            a.rate(rate);
            a.play();
            cj.backgroundSound = a;
        });
    }

    function playSound(url, volume = 1, rate = 1) {
        return new Promise((resolve, reject) => {
            let a = new Howl({
                src: [url],
                volume: volume,
                onend: function () {
                    resolve();
                },
            });
            a.rate(rate);
            a.play();
            a.fade(volume, 0.0, 1000); //a.duration() * 500 );
            cj.lastSound = a;
        });
    }

    function getNextNote() {
        if (
            performance.now() - lastNoteTime > 900 ||
            this.noteCount > maxNotesPerPattern
        ) {
            changePattern();
            noteCount = 0;
        }

        let e = scaleProgressions[currentScaleProgression];
        scale = e.scale;
        
        // Add melodic contour logic
        let n;
        if (recentNotes.length >= 2 && Math.random() < 0.7) {
            // 70% of the time, create a melodic contour
            // Check the direction of the last two notes
            const direction = recentNotes[recentNotes.length - 1] - recentNotes[recentNotes.length - 2];
            
            if (direction > 0) {
                // If melody was going up, 60% chance to continue up, 40% to go down
                if (Math.random() < 0.6) {
                    // Continue upward with smaller steps
                    n = getNote(scale, 1, 3);
                } else {
                    // Change direction down with larger step
                    n = getNote(scale, -2, -5);
                }
            } else {
                // If melody was going down, 60% chance to continue down, 40% to go up
                if (Math.random() < 0.6) {
                    // Continue downward with smaller steps
                    n = getNote(scale, -1, -3);
                } else {
                    // Change direction up with larger step
                    n = getNote(scale, 2, 5);
                }
            }
        } else {
            // 30% of the time, get a note normally
            n = getNote(scale);
        }
        
        while (n === lastNoteNumber) {
            n = getNote(scale);
        }

        // console.log(currentScaleProgressions, pattern, scale);

        if (e.root !== lastRoot) {
            n = scaleifyNote(n, e.targetNotes);
        }

        var a = n || 48;
        var s = null;
        s = notes.filter(
            (x) => x.metaData.startRange <= a && a <= x.metaData.endRange
        )[0];
        // NOTE: OOPS THIS MIGHT BE THE WRONG SPOT FOR SHIFTSOURCE
        // let shifted = shiftSource( s.metaData.root, s.metaData.startRange, s.metaData.endRange );
        let c = a - s.metaData.root;
        let playbackRate = semitonesToPlaybackRate(c);
        // console.log("playback", c, playbackRate);
        let playNote = s;
        playNote.playbackRate = playbackRate;
        playNote.midiNote = a; // Store the MIDI note number for melodic contour analysis

        // Store this note in our recent notes history for melodic contour
        recentNotes.push(a);
        if (recentNotes.length > MAX_RECENT_NOTES) {
            recentNotes.shift(); // Remove oldest note
        }

        noteCount++;
        lastNoteTime = performance.now();
        lastNoteNumber = n;
        lastRoot = e.root;
        return playNote;
    }

    // Enhanced getNote function that can optionally specify directional movement
    function getNote(scale, minStep = null, maxStep = null) {
        // scale.length || (scale = e.scalesToUse[Math.floor(Math.random() * e.scalesToUse.length)]),
        if (pattern < 0) {
            changePattern();
        }
        
        let t = patterns[pattern][currentStep];
        
        // Apply directional movement if specified
        if (minStep !== null && maxStep !== null && recentNotes.length > 0) {
            const lastNote = recentNotes[recentNotes.length - 1];
            const range = Math.abs(maxStep - minStep);
            const step = minStep + Math.floor(Math.random() * range);
            t = lastNote + step;
            
            // Keep notes within a reasonable range
            t = Math.max(48, Math.min(t, 84));
        }
        
        let n = t + scales[scale][t % 12];
        let r = transpose + n;
        currentStep = (currentStep + 1) % patterns[pattern].length;
        return r;
    }

    function getRandomInt(number) {
        return Math.floor(number * Math.random());
    }

    function changePattern() {
        pattern = getRandomInt(patterns.length);
        currentStep = 0;
    }

    function getClosestTarget(t, e) {
        return t.reduce(function (t, n) {
            return Math.abs(n - e) < Math.abs(t - e) ? n : t;
        });
    }

    function scaleifyNote(t, e) {
        var n = ((t % 12) + 5) % 12;
        if (
            void 0 ==
            e.filter(function (t) {
                return t === n;
            })[0]
        ) {
            var r = getClosestTarget(e, t);
            var o = (t -= n - r);
            t = o += scales[scale][((o % 12) + 5) % 12];
        }
        return t;
    }

    function getNoteFromSemitone(tone) {
        return notes.filter(
            (x) => x.metaData.startRange <= tone && tone <= x.metaData.endRange
        )[0];
    }

    let currentScaleProgression = 0;
    let root = 0;
    let lastRoot = undefined;
    let pattern = -1;
    let scale = "custom";
    let transpose = -5;
    let currentStep = 0;
    let lastNoteTime = 0;
    let lastNoteNumber = 0;
    let noteCount = 0;

    return cj;
};
