# Paste and Type

A Chrome extension that adds a floating button to every website. Paste text into its panel, click into a text box, and it types the text in for you one key at a time. Useful on sites that block normal pasting.

## Install

1. Download **paste-and-type.zip** from the [latest release](../../releases/latest) and unzip it. You get a folder called `paste-and-type`.
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `paste-and-type` folder.
5. Optional: click the puzzle-piece icon in the toolbar and pin **Paste and Type**.

Keep the folder after installing. Chrome loads the extension from it, so deleting or moving it removes the extension.

## Use

1. Click the gold keyboard button in the bottom-right corner of any page.
2. Paste your text into the panel.
3. Click into the box you want it typed in.
4. Press **Start typing**. You get a short countdown first, set by **Start delay**.

Press **Esc** or **Stop** to stop typing.

### Settings

- **Delay per key:** time between keystrokes.
- **Start delay:** countdown before typing begins.
- **Mistakes:** sometimes hits a neighboring key, then backspaces and fixes it, like a person would.
- **Human-like rhythm:** varies the speed between keys.
- **Hide button on this site:** removes the floating button on that site. Click the toolbar icon to bring it back.

It doesn't work on `chrome://` pages or the Chrome Web Store, because Chrome doesn't let extensions run there.

## Privacy

Everything stays in your browser. The extension doesn't send anything anywhere. Its only permission is `storage`, which it uses to remember your text and settings.
