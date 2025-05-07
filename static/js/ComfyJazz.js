/**
 * ComfyJazz - A JavaScript library for generating ambient jazz music
 * 
 * This module creates a cozy jazz atmosphere with background music and
 * procedurally generated melodic phrases. It can be triggered by chat messages
 * or play automatically with natural-sounding musical patterns.
 * 
 * @requires Howler.js https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js
 */

const ComfyJazz = (options = {}) => {
  const cj = { ...defaultOptions, ...options };

  /////////////////////
  // Public API Methods
  /////////////////////

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
  // Internal State
  /////////////////////

  // Store previous notes for melodic contour analysis
  const recentNotes = [];
  const MAX_RECENT_NOTES = 5;

  // Track phrase state for natural breathing space between musical phrases
  let phraseState = {
    notesPlayed: 0,
    inBreathingSpace: false,
    breathingSpaceEndTime: 0,
  };

  /**
   * Initializes and starts the ComfyJazz system
   *
   * Sets up the background music loop and starts the automatic note player
   * that generates melodic phrases with natural breathing spaces.
   */
  async function startComfyJazz() {
    let startTime = performance.now();

    // Start the background music loop
    playBackgroundSound(
      `${cj.soundFolder}/${cj.backgroundLoopUrl}`,
      cj.volume,
      1
    );

    /**
     * Automatically plays notes at intervals to create a natural jazz atmosphere
     * with breathing spaces between phrases
     */
    const AutomaticPlayNote = async () => {
      let currentTime = (performance.now() - startTime) / 1000;

      // Restart background music when the loop duration is reached
      if (currentTime > cj.backgroundLoopDuration) {
        startTime = performance.now();
        currentTime = 0;

        playBackgroundSound(
          `${cj.soundFolder}/${cj.backgroundLoopUrl}`,
          cj.volume,
          1
        );
      }

      // Update the current scale progression based on time
      for (let i = 0; i < scaleProgressions.length; i++) {
        if (
          scaleProgressions[i].start <= currentTime &&
          currentTime <= scaleProgressions[i].end
        ) {
          currentScaleProgression = i;
          break;
        }
      }

      // Manage breathing spaces between musical phrases
      const currentTimeMs = performance.now();
      if (phraseState.inBreathingSpace) {
        if (currentTimeMs >= phraseState.breathingSpaceEndTime) {
          phraseState.inBreathingSpace = false;
          phraseState.notesPlayed = 0;
        }
      } else {
        // Start a breathing space after 3-6 notes
        if (phraseState.notesPlayed >= 3 + Math.floor(Math.random() * 4)) {
          phraseState.inBreathingSpace = true;
          // Breathing space duration between 800-2000ms
          const breathingDuration = 800 + Math.floor(Math.random() * 1200);
          phraseState.breathingSpaceEndTime = currentTimeMs + breathingDuration;
        } else if (
          cj.playAutoNotes &&
          Math.random() < cj.autoNotesChance &&
          !phraseState.inBreathingSpace
        ) {
          // Play a note when not in breathing space
          playNoteRandomly(0, 200);
          phraseState.notesPlayed++;
        }
      }

      // Schedule the next automatic note
      setTimeout(AutomaticPlayNote, cj.autoNotesDelay);
    };

    // Start the automatic note player
    AutomaticPlayNote();
  }

  /**
   * Plays a sequence of notes with coherent melodic movement
   *
   * @param {number} numNotes - Number of notes to play (random if not specified)
   * @returns {number} - The number of notes played
   */
  function playNoteProgression(numNotes) {
    if (numNotes == null) {
      numNotes = (Math.random() * 8) >> 0;
    }

    // Reset state for a new progression
    phraseState.notesPlayed = 0;
    phraseState.inBreathingSpace = false;
    recentNotes.length = 0; // Clear recent notes history for a fresh start

    // Pre-calculate the melodic direction for this progression
    const direction = Math.random() < 0.5 ? 1 : -1; // Choose up or down
    const baseNote = getNote(scale); // Get a starting note

    for (let i = 0; i < numNotes; i++) {
      // Use smaller steps for chat-triggered notes
      const step = direction * (1 + Math.floor(Math.random() * 2)); // 1-2 steps in the chosen direction
      playNoteRandomly(100, 200 * i, step);
    }
    return numNotes;
  }

  /**
   * Plays a single note with timing variations and dynamic volume
   *
   * @param {number} minRandom - Minimum delay before playing the note
   * @param {number} maxRandom - Maximum delay before playing the note
   * @param {number} suggestedStep - Optional step size for melodic movement
   */
  async function playNoteRandomly(
    minRandom = 0,
    maxRandom = 200,
    suggestedStep = null
  ) {
    // Add swing feel - delay notes that fall on off-beats
    const swingFactor =
      phraseState.notesPlayed % 2 === 1 ? 15 + Math.random() * 25 : 0;

    setTimeout(async () => {
      let sound;
      if (suggestedStep !== null && recentNotes.length > 0) {
        // Use the suggested step for more coherent melodic movement
        const lastNote = recentNotes[recentNotes.length - 1];
        const targetNote = lastNote + suggestedStep;
        sound = getNextNote(targetNote);
      } else {
        sound = getNextNote();
      }

      const instruments = cj.instrument.split(",").map((x) => x.trim());
      let instrument = instruments[getRandomInt(instruments.length)];

      // Add velocity variation based on melodic position
      let noteVolume = cj.volume;
      if (phraseState.notesPlayed === 0 || isLocalPeak(sound.midiNote)) {
        noteVolume = Math.min(1.0, noteVolume * (1.1 + Math.random() * 0.05));
      } else if (
        phraseState.notesPlayed > 0 &&
        phraseState.notesPlayed % 4 === 3
      ) {
        noteVolume = noteVolume * (0.85 + Math.random() * 0.1);
      }

      await playSound(
        `${cj.soundFolder}/${instrument}/${sound.url}.ogg`,
        noteVolume,
        sound.playbackRate
      );
    }, minRandom + Math.random() * maxRandom + swingFactor);
  }

  /**
   * Determines if a note is a local peak in the melodic contour
   *
   * @param {number} midiNote - The MIDI note number to check
   * @returns {boolean} - True if the note is higher than surrounding notes
   */
  function isLocalPeak(midiNote) {
    if (recentNotes.length < 2) return false;

    // Note is higher than both the previous and next notes
    return (
      midiNote > recentNotes[recentNotes.length - 1] &&
      midiNote > recentNotes[recentNotes.length - 2]
    );
  }

  ////////////////////////////////
  // Music Generation Functions
  ////////////////////////////////

  /**
   * Converts semitone difference to playback rate
   *
   * @param {number} t - Number of semitones to shift
   * @returns {number} - Playback rate multiplier
   */
  function semitonesToPlaybackRate(t) {
    var e = Math.pow(2, 1 / 12);
    return Math.pow(e, t);
  }

  /**
   * Generates a random value within a range
   *
   * @param {number} tone - Base tone
   * @param {number} startRange - Start of range
   * @param {number} endRange - End of range
   * @returns {number} - Random value in range
   */
  function shiftSource(tone, startRange, endRange) {
    let a = startRange,
      u = endRange,
      c = new WeakMap();

    let n = a + Math.random() * (u - a);
    return n;
  }

  /**
   * Plays a background sound that loops
   *
   * @param {string} url - URL of the sound file
   * @param {number} volume - Volume level (0-1)
   * @param {number} rate - Playback rate
   * @returns {Promise} - Resolves when sound starts playing
   */
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

  /**
   * Plays a sound with fade-out effect
   *
   * @param {string} url - URL of the sound file
   * @param {number} volume - Volume level (0-1)
   * @param {number} rate - Playback rate
   * @returns {Promise} - Resolves when sound starts playing
   */
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
      a.fade(volume, 0.0, 1000);
      cj.lastSound = a;
    });
  }

  /**
   * Gets the next note to play based on current scale and melodic context
   *
   * @param {number} suggestedNote - Optional specific note to use
   * @returns {Object} - Note object with playback information
   */
  function getNextNote(suggestedNote = null) {
    if (
      performance.now() - lastNoteTime > 900 ||
      this.noteCount > maxNotesPerPattern
    ) {
      changePattern();
    }

    let e = scaleProgressions[currentScaleProgression];
    scale = e.scale;

    let n;
    if (suggestedNote !== null) {
      // Use the suggested note if provided
      n = suggestedNote;
    } else if (recentNotes.length >= 2 && Math.random() < 0.7) {
      // Original melodic contour logic for automatic notes
      const direction =
        recentNotes[recentNotes.length - 1] -
        recentNotes[recentNotes.length - 2];

      if (direction > 0) {
        if (Math.random() < 0.6) {
          n = getNote(scale, 1, 3);
        } else {
          n = getNote(scale, -2, -5);
        }
      } else {
        if (Math.random() < 0.6) {
          n = getNote(scale, -1, -3);
        } else {
          n = getNote(scale, 2, 5);
        }
      }
    } else {
      n = getNote(scale);
    }

    // Avoid repeating the same note
    while (n === lastNoteNumber) {
      n = getNote(scale);
    }

    // Adjust note if root has changed
    if (e.root !== lastRoot) {
      n = scaleifyNote(n, e.targetNotes);
    }

    var a = n || 48;
    var s = null;
    s = notes.filter(
      (x) => x.metaData.startRange <= a && a <= x.metaData.endRange
    )[0];

    let c = a - s.metaData.root;
    let playbackRate = semitonesToPlaybackRate(c);
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

  /**
   * Gets a note from the current scale with optional directional movement
   * 
   * @param {string} scale - Scale to use
   * @param {number} minStep - Minimum step size for directional movement
   * @param {number} maxStep - Maximum step size for directional movement
   * @returns {number} - MIDI note number
   */
  function getNote(scale, minStep = null, maxStep = null) {
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

  /**
   * Generates a random integer between 0 and the given number
   * 
   * @param {number} number - Upper bound (exclusive)
   * @returns {number} - Random integer
   */
  function getRandomInt(number) {
    return Math.floor(number * Math.random());
  }

  /**
   * Changes to a new random pattern
   */
  function changePattern() {
    pattern = getRandomInt(patterns.length);
    currentStep = 0;
  }

  /**
   * Finds the closest target note from a list of possible targets
   * 
   * @param {Array} t - Array of possible target notes
   * @param {number} e - Note to find closest match for
   * @returns {number} - Closest target note
   */
  function getClosestTarget(t, e) {
    return t.reduce(function (t, n) {
      return Math.abs(n - e) < Math.abs(t - e) ? n : t;
    });
  }

  /**
   * Adjusts a note to fit within the current scale
   * 
   * @param {number} t - Note to adjust
   * @param {Array} e - Array of target notes in the scale
   * @returns {number} - Adjusted note
   */
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

  /**
   * Gets a note object from a MIDI note number
   * 
   * @param {number} tone - MIDI note number
   * @returns {Object} - Note object
   */
  function getNoteFromSemitone(tone) {
    return notes.filter(
      (x) => x.metaData.startRange <= tone && tone <= x.metaData.endRange
    )[0];
  }

  // Global state variables
  let currentScaleProgression = 0;
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
