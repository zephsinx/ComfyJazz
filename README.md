# ComfyJazz

![GitHub repo size](https://img.shields.io/github/repo-size/zephsinx/ComfyJazz)
![GitHub contributors](https://img.shields.io/github/contributors/zephsinx/ComfyJazz)
![Twitch channel](https://img.shields.io/twitch/status/zephsinx?style=social)

ComfyJazz is a tool to play easy-listening, comfy, computer-generated Jazz music, with built-in Twitch and YouTube chat
integration. Notes are played along randomly and for each chat message on your channel.

## Table of Contents

- [Credits](#credits)
- [Prerequisites](#prerequisites)
- [Using ComfyJazz](#using-comfyjazz)
  - [Twitch](#twitch)
  - [YouTube](#youtube)

## Credits

All credits to the original project go to [@Instafluff](https://github.com/instafluff) and all participants in the
original project. Instafluff can also be found on Twitch at [ttv/Instafluff](https://twitch.tv/instafluff)

## Prerequisites

This is a static web application and doesn't require any server-side components or installations. You just need:

- A web browser to access the HTML file
- For streaming: broadcasting software like OBS with a Browser Source capability

## Using ComfyJazz

### Twitch

1. Open the index.html file directly in your browser or host it on any static web server.
2. Add a Browser Source to your broadcasting software (e.g. [OBS](https://obsproject.com/kb/browser-source)).
3. In the URL field, enter the path to the index.html file with your channel parameter: `index.html?channel=yourchannel`
    - Replace `yourchannel` with your Twitch username.
4. Enjoy!

Example:

```url
index.html?channel=zephsinx
```

### YouTube

To integrate ComfyJazz with YouTube Live chat, you can use [Streamer.bot](https://streamer.bot/):

#### Streamer.bot Integration

By connecting [Streamer.bot](https://streamer.bot/) to your YouTube account, you can make ComfyJazz listen to
events emitted by Streamer.bot when it detects a YouTube Live message.

1. Set up [Streamer.bot](https://streamer.bot/) and log in with your YouTube account you use for streaming.
2. Ensure your Streamer.bot WebSocket server is started, and using the default IP and Port.
3. Open the index.html file in your browser or add it as a Browser Source in OBS.
4. In the URL field, add the parameter: `?useStreamerBot=true`
5. Enjoy!

## Customization Options

You can customize ComfyJazz by adding parameters to the URL:

- `channel`: Your Twitch channel name
- `autoNotesChance`: Probability (0.0-1.0) of auto-playing notes
- `autoNotesDelay`: Delay between auto notes in milliseconds
- `backgroundLoopUrl`: Custom background loop file
- `instrument`: Instrument to use (default: piano)
- `playAutoNotes`: Whether to play auto notes (true/false)
- `volume`: Initial volume (0.0-1.0)
- `maxNotes`: Maximum number of notes to play per chat message
- `useStreamerBot`: Set to "true" to use Streamer.bot for YouTube integration

Example:

```url
index.html?channel=yourchannel&volume=0.7&autoNotesChance=0.3
```

## Keyboard Controls

- Press any key to play a note progression
- Press 'c' to toggle the configuration panel
