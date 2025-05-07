# ComfyJazz Static Version

This is the static version of ComfyJazz that can be hosted on any static file server without requiring Node.js. ComfyJazz generates relaxing, computer-generated jazz music that can be integrated with Twitch and YouTube chat.

## Quick Start

1. Upload all files in this directory to any static web hosting service
2. Access index.html in your browser directly or add to OBS as a browser source
3. Add your Twitch channel name as a URL parameter: `?channel=yourchannel`

## Features

- Computer-generated jazz music with pleasant harmonies
- Twitch chat integration (plays notes when viewers send messages)
- YouTube integration via Streamer.bot
- Customizable settings via URL parameters
- Settings persistence using localStorage
- No server required - works on any static hosting

## Usage

### Basic Setup

Simply host these files on any static web server or file hosting service, and open the index.html file in a web browser.

### Testing Locally

1. Open `test.html` in your browser to verify the implementation works correctly
2. Follow the checklist to ensure all features are functioning as expected
3. Experiment with different configuration parameters

### Adding to OBS

1. Add a Browser source to your OBS scene
2. Set the URL to the location where you've hosted the index.html file
3. For example: `https://yourserver.com/comfyjazz/index.html?channel=yourchannel`
4. Set Width: 800, Height: 600 (or as needed)
5. Check "Control audio via OBS" if you want to manage volume through OBS

### URL Parameters

You can customize ComfyJazz by adding parameters to the URL:

- `channel`: Your Twitch channel name (for Twitch chat integration)
- `autoNotesChance`: Probability (0.0-1.0) of auto-playing notes
- `autoNotesDelay`: Delay between auto notes in milliseconds
- `backgroundLoopUrl`: Custom background loop file (must be in the sounds folder)
- `instrument`: Instrument to use (default: piano)
- `playAutoNotes`: Whether to play auto notes (true/false)
- `volume`: Initial volume (0.0-1.0)
- `maxNotes`: Maximum number of notes to play per chat message
- `useStreamerBot`: Set to "true" to use Streamer.bot for YouTube integration

Example:
```
index.html?channel=yourchannel&volume=0.7&autoNotesChance=0.3
```

## YouTube Integration

To integrate with YouTube chat, you need to use Streamer.bot:

1. Set up [Streamer.bot](https://streamer.bot/) and connect it to your YouTube account
2. Add the `useStreamerBot=true` parameter to your URL
3. Ensure Streamer.bot is running with its WebSocket server enabled
4. Set up a Streamer.bot action that triggers on YouTube messages

## Available Instruments

- piano (default)
- clarinet
- guitar
- guzheng
- harp
- sax
- sax2
- twinkle
- vibraphone

Example using a different instrument:
```
index.html?instrument=vibraphone
```

## Keyboard Controls

- Press any key to play a note progression
- Press 'c' to toggle the configuration panel
- Use the volume slider to adjust sound level

## File Structure

- `index.html` - Main entry point
- `js/` - JavaScript files
  - `ComfyJazz.js` - Core music generation logic
  - `Constants.js` - Musical patterns and constants
  - `SbClient.js` - Streamer.bot integration
- `sounds/` - Sound assets
  - `jazz_loop.ogg` - Background loop
  - `piano/` - Piano notes

## Credits

All credits to the original project go to [@Instafluff](https://github.com/instafluff) and all participants in the original project. Instafluff can also be found on Twitch at [ttv/Instafluff](https://twitch.tv/instafluff)
