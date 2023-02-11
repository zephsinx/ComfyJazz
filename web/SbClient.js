// Create a new client with default options
let client;

async function enableYTSounds() {
    client = new StreamerbotClient({ immediate: false });
    client.connect().then(() => {
        client.on('YouTube.Message', () => {
            comfyJazz.playNoteProgression(maxNotes);
        });
    });
}