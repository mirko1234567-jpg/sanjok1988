# TikTok Auto Unfollow Chrome Extension

Automatically unfollow users on TikTok in bulk with customizable options. This extension allows you to unfollow both "Following" and "Friends" accounts with a 2-second delay between each action to avoid rate limiting.

## Features

✨ **Smart Button Detection**
- Automatically detects and counts "Following" and "Friends" buttons separately
- Scans page dynamically and filters buttons by visibility and text content
- Works with TikTok's dynamic DOM structure

🔄 **Auto-Scrolling**
- Automatically scrolls through your follower list to load all accounts
- Loads up to 50 scroll iterations with smart detection for end-of-list
- Ensures you can unfollow hundreds of accounts in one session

📊 **Real-Time Progress Tracking**
- Shows live count of unfollowed accounts during the process
- Displays separate counters for "Following" and "Friends" buttons
- Shows total buttons scanned vs. filtered count
- Clear status messages for each phase (loading, scanning, unfollowing, done)

⚙️ **Flexible Options**
- Choose to unfollow "Following" accounts, "Friends" accounts, or both
- Checkboxes to select which button types to click
- At least one option must be selected to start

⏱️ **Rate Limit Protection**
- 2-second delay between each unfollow action
- Helps avoid TikTok's rate limiting and action blocks
- Safe for your account

## Setup & Installation

1. **Clone or download this extension** to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select the extension folder.

## How to Use

### Step-by-Step Instructions

1. **Login to TikTok**
   - Open [tiktok.com](https://www.tiktok.com) in your browser.
   - Sign in with your TikTok account.

2. **Go to your profile**
   - Click on your profile icon in the top right corner.

3. **Click on Following**
   - From your profile, click the **Following** tab to view all accounts you follow.
   - A list of accounts will appear.

4. **Scroll down to load the buttons**
   - Scroll down the page so that the "Following" buttons are visible.
   - Make sure at least some follow buttons are loaded on the page before proceeding.

5. **Click on the extension**
   - Click the extension icon in your Chrome toolbar (top right of the browser).
   - The extension popup will open.

6. **Select unfollow options**
   - Check **"Unfollow Following"** to unfollow accounts you follow (default: checked)
   - Check **"Unfollow Friends"** to unfollow accounts in your Friends list (optional)
   - You must select at least one option.

7. **Click "Start Auto Unfollow"**
   - The extension will:
     - Show "Loading all followers..." while scrolling through your list
     - Display "Found: X followers" with breakdown (Following: Y | Friends: Z)
     - Begin unfollowing with live progress: "Following: X | Friends: Y"
     - Show "Done — Following: X | Friends: Y" when complete
   - Each unfollow has a 2-second delay to avoid hitting TikTok rate limits.
   - The button is disabled while running and re-enables when done.

## Understanding the Display

### Status Messages

- **"Loading all followers..."** - The extension is scrolling to load all your followers
- **"Found: 50 followers"** - Total followers found and ready to unfollow
- **"Following: 10 | Friends: 5"** - Real-time count during unfollowing (10 Following, 5 Friends)
- **"Done — Following: 30 | Friends: 20"** - Final count when complete

### Details Section

Shows three pieces of information:
- **Scanned**: Total button elements found on the page
- **Filtered**: Total buttons matching "Following" or "Friends" criteria
- **Breakdown**: Count of each type found (Following: X | Friends: Y)

## Important Notes

⚠️ **Before Starting:**
- The extension only works when you're logged into TikTok
- Make sure the page has fully loaded before clicking start
- Have the Following tab open (not any other tab)

⚠️ **During Operation:**
- Do not navigate away from the page during unfollowing
- Keep the browser active for best results
- The 2-second delay prevents TikTok from blocking your account
- Large batches may take 30+ minutes depending on count

⚠️ **Best Practices:**
- Start with smaller batches to test (unfollow 20-50 at a time)
- Take breaks between large unfollowing sessions
- Monitor for any TikTok notifications or rate-limit warnings
- If blocked, wait several hours before trying again

## Troubleshooting

**No buttons found?**
- Ensure you're on the Following tab (not Following list in discovery)
- Wait for the page to load completely
- Try scrolling manually first to load some followers

**Extension not working?**
- Reload the extension at `chrome://extensions/`
- Check that TikTok is fully loaded
- Try closing and reopening the popup

**Slow performance?**
- Large follower counts may take time to process
- The 2-second delay is intentional to avoid rate limiting
- Close other tabs to reduce CPU usage

## Technical Details

- **Language**: JavaScript
- **Platform**: Chrome Extension (Manifest V3)
- **API Used**: Chrome Runtime & Tabs APIs
- **Page Interaction**: DOM manipulation, click events
- **Safety**: No data collection, fully local processing

## Disclaimer

Use this extension responsibly. TikTok's terms of service may restrict automated actions. The author is not responsible for any account suspension or action. Use at your own risk.

## License

MIT License - Free to use and modify

## Contributing

Found a bug or want to improve the extension? Feel free to submit issues or pull requests!

