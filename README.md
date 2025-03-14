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

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and visible in your browser toolbar

### Chrome Web Store

1. Coming soon

## Usage

1. Navigate to any webpage with text content
2. Position your cursor near the text you want to summarize
3. Type the sequence "T", "L", "D", "R" on your keyboard (not in a text input field)
4. A summary will appear at the top of the text content

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
