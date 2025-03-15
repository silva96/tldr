# TLDR Extension

A browser extension that generates concise summaries of text on any webpage with a simple keypress sequence.

## Features

- 📝 Summarize any text content on a webpage
- 🔑 Simple activation with "TLDR" keypress sequence
- 🌐 Multilingual support (uses your browser's language)
- 🔄 Works with both OpenAI (GPT) and Anthropic (Claude) AI models
- 📊 Shows token usage and cost information (optional)
- 🌟 Clean, non-intrusive UI

## Installation

### Manual Installation (Developer Mode)

1. Download the ZIP file from GitHub by clicking the green "Code" button and selecting "Download ZIP"
   ![Download ZIP](/images/CleanShot%202025-03-15%20at%2010.10.14%202.png)
2. Extract the downloaded ZIP file to a folder on your computer
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top-right corner)
5. Click "Load unpacked" and select the directory containing the extracted extension files
6. The extension should now be installed and visible in your browser toolbar

**Important:** The extension will not work on tabs that were already open before installation. You must open new tabs after installing for the extension to be properly loaded and functional.

### Chrome Web Store

1. Coming soon

## Usage

1. Navigate to any webpage with text content
2. Use one of these methods to summarize content:
   - **Selected Text**: Highlight any text (minimum 100 characters) and type the TLDR sequence
   - **Articles**: Place your cursor near an article and type the TLDR sequence to summarize the entire article
   - **Gmail**: When viewing emails in Gmail, trigger the TLDR sequence to summarize the current email
   - **General Text**: For any other text content, position your cursor near it and type the TLDR sequence
3. Type the sequence "T", "L", "D", "R" on your keyboard (not in a text input field)
4. A summary will appear at the top of the content

The extension intelligently prioritizes content in this order:

1. Your selected text (if any)
2. Full articles (the extension will detect if you're inside an article)
3. Gmail messages (when using Gmail)
4. General text content near your cursor

## Configuration

After installing the extension, you'll need to set up your API keys:

1. Click on the TLDR extension icon in your browser toolbar
2. Click "Options" to open the settings page
3. Enter your OpenAI API key, Anthropic API key, or both
4. Select your preferred AI provider
5. Toggle the token cost display on/off as desired
6. Your settings will be saved automatically

## Getting API Keys

### OpenAI API Key

1. Visit [OpenAI's platform](https://platform.openai.com/)
2. Create an account or log in
3. Navigate to the [API keys section](https://platform.openai.com/account/api-keys)
4. Create a new secret key
5. Copy the key and paste it into the extension's options page

### Anthropic API Key

1. Visit [Anthropic's Claude API page](https://www.anthropic.com/product)
2. Sign up for API access
3. Once approved, retrieve your API key from your account dashboard
4. Copy the key and paste it into the extension's options page

## Privacy

- Your API keys are stored locally in your browser's secure storage
- Text content is sent directly from your browser to the AI provider's API
- The extension does not collect or store any user data
- Summaries are generated and displayed locally

## Technical Details

- Uses Chrome Extension Manifest V3
- Implements content scripts to interact with webpage content
- Supports both OpenAI and Anthropic APIs for text summarization
- Language detection based on browser settings for multilingual summaries
- Minimally invasive with careful DOM manipulation

## Development

### Reloading After Code Changes

When you make changes to the extension code:

1. Navigate to `chrome://extensions/`
2. Find the TLDR Extension and click the refresh icon (🔄)
3. **Important:** Changes to content scripts will not apply to already open tabs
4. To see the changes, you must open a new tab after reloading the extension
5. The refreshed code will only be injected into newly loaded pages

This behavior is standard for Chrome extensions - refreshing the extension at `chrome://extensions` doesn't re-inject content scripts into existing tabs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
