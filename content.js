// Track keypress sequence
let keypressSequence = [];
const targetSequence = ["t", "l", "d", "r"];
let lastKeypressTime = 0;
const maxTimeBetweenKeyPresses = 1000; // 1 second

// Track cursor position more accurately
let cursorPosition = { x: 0, y: 0 };
document.addEventListener("mousemove", function (e) {
  cursorPosition.x = e.clientX;
  cursorPosition.y = e.clientY;
});

// Listen for keydown events
document.addEventListener("keydown", (event) => {
  // Skip if user is typing in an input, textarea or any editable element
  if (isUserTyping()) {
    return;
  }

  // Skip if any modifier keys are pressed (Cmd, Ctrl, Alt, Shift)
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
    return;
  }

  const currentTime = Date.now();
  const key = event.key.toLowerCase();

  // Reset sequence if too much time has elapsed since last keypress
  if (
    currentTime - lastKeypressTime > maxTimeBetweenKeyPresses &&
    keypressSequence.length > 0
  ) {
    keypressSequence = [];
  }

  lastKeypressTime = currentTime;

  // Add the lowercase key to the sequence
  keypressSequence.push(key);

  // Only keep the last 4 keypresses
  if (keypressSequence.length > 4) {
    keypressSequence.shift();
  }

  // Check if the sequence matches
  if (arraysEqual(keypressSequence, targetSequence)) {
    // Prevent default browser behavior
    event.preventDefault();

    // Reset the sequence
    keypressSequence = [];

    // Get text near cursor and summarize
    summarizeNearestText();
  } else if (targetSequence.includes(key)) {
    // If this key is part of our target sequence, prevent default to avoid triggering site shortcuts
    // This prevents Twitter's shortcuts from activating during our sequence
    event.preventDefault();
  }
});

// Check if arrays are equal
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// Check if user is currently typing in an input field
function isUserTyping() {
  const activeElement = document.activeElement;
  const tagName = activeElement.tagName.toLowerCase();

  // Check if the active element is an input, textarea, or has contenteditable attribute
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    activeElement.isContentEditable ||
    activeElement.getAttribute("contenteditable") === "true"
  );
}

// Find and summarize the nearest text block to the cursor
function summarizeNearestText() {
  // Find the element closest to the cursor that contains text
  const element = findNearestTextElement(cursorPosition);

  if (!element) {
    console.log("Could not find suitable text element to summarize");
    showNotification("Could not find suitable text to summarize near cursor");
    return;
  }

  // Get the text to summarize
  const textToSummarize = element.innerText || element.textContent;

  if (!textToSummarize || textToSummarize.trim().length < 100) {
    console.log("Text is too short to summarize");
    showNotification("Text is too short to summarize (minimum 100 characters)");
    return;
  }

  // Show loading indicator
  const loadingIndicator = showLoading(element);

  // Generate summary using OpenAI API
  generateAISummary(textToSummarize)
    .then((summaryData) => {
      // Remove loading indicator
      loadingIndicator.remove();
      // Display the summary
      displaySummary(element, summaryData);
    })
    .catch((error) => {
      console.error("Error generating summary:", error);
      loadingIndicator.remove();
      showNotification("Error generating summary. Please check your API key.");
    });
}

// Find the nearest element containing text
function findNearestTextElement(cursorPosition) {
  // Check if we're on Twitter
  const isTwitter =
    window.location.hostname.includes("twitter.com") ||
    window.location.hostname.includes("x.com");

  // Special handling for Twitter
  if (isTwitter) {
    return findTwitterTweet(cursorPosition);
  }

  // Elements to ignore
  const ignoreTags = [
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "META",
    "LINK",
    "BUTTON",
    "INPUT",
    "TEXTAREA",
  ];

  // Get all text-containing elements in the viewport
  const textElements = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: function (node) {
        // Skip elements to ignore
        if (ignoreTags.includes(node.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Check if it has meaningful text content
        const text = node.innerText || node.textContent;
        if (text && text.trim().length >= 100) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  // Collect potential elements
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    const rect = currentNode.getBoundingClientRect();

    // Skip if element is not visible or outside viewport
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      rect.top > window.innerHeight ||
      rect.bottom < 0 ||
      rect.left > window.innerWidth ||
      rect.right < 0
    ) {
      continue;
    }

    // Calculate distance to cursor
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(centerX - cursorPosition.x, 2) +
        Math.pow(centerY - cursorPosition.y, 2)
    );

    textElements.push({
      element: currentNode,
      distance: distance,
      text: (currentNode.innerText || currentNode.textContent).trim(),
    });
  }

  if (textElements.length === 0) {
    return null;
  }

  // Sort by distance to cursor
  textElements.sort((a, b) => a.distance - b.distance);

  // Return the closest element
  return textElements[0].element;
}

// Find a complete tweet on Twitter
function findTwitterTweet(cursorPosition) {
  // Find elements near cursor
  const elementsAtPoint = document.elementsFromPoint(
    cursorPosition.x,
    cursorPosition.y
  );

  // Look for tweet containers
  for (let element of elementsAtPoint) {
    // Look for the article element which contains the tweet
    const articleElement = findParentWithTagName(element, "article");
    if (articleElement) {
      return articleElement;
    }
  }

  // Fallback: find closest article to cursor
  const articles = document.querySelectorAll("article");
  if (articles.length > 0) {
    let closestArticle = null;
    let closestDistance = Infinity;

    for (let article of articles) {
      const rect = article.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - cursorPosition.x, 2) +
          Math.pow(centerY - cursorPosition.y, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestArticle = article;
      }
    }

    if (closestArticle) {
      return closestArticle;
    }
  }

  return null;
}

// Helper function to find parent with specific tag name
function findParentWithTagName(element, tagName) {
  let current = element;
  while (current) {
    if (
      current.tagName &&
      current.tagName.toLowerCase() === tagName.toLowerCase()
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

// Get API settings from Chrome storage
async function getAPISettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        openaiApiKey: "",
        anthropicApiKey: "",
        aiProvider: "openai",
        showTokenCost: true,
      },
      function (result) {
        resolve(result);
      }
    );
  });
}

// Get the user's preferred language from the browser
function getUserLanguage() {
  // Get the browser's language (e.g., "en-US", "es", "fr", etc.)
  return navigator.language || navigator.userLanguage || "en";
}

// Get system prompt for summarization
function getSystemPrompt(outputLanguage) {
  return `You are a helpful assistant that creates concise summaries of texts the user is currently reading on the internet. 
Provide a brief TLDR summary of the text, capturing the main points in a few sentences. 
Your summary should be in the language specified by this locale: "${outputLanguage}".
Just return the summary, no other text. Never start your response with "Here's a summary of the text:", "TLDR:" or anything similar.`;
}

// Generate summary using the appropriate API
async function generateAISummary(text) {
  // Get API settings
  const settings = await getAPISettings();

  // Check which provider to use
  if (settings.aiProvider === "openai") {
    return generateOpenAISummary(text, settings.openaiApiKey);
  } else {
    return generateAnthropicSummary(text, settings.anthropicApiKey);
  }
}

// Generate summary using OpenAI API
async function generateOpenAISummary(text, apiKey) {
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not set. Please set it in the extension options."
    );
  }

  // Get user's preferred language
  const outputLanguage = getUserLanguage();

  // Get the system prompt
  const systemPrompt = getSystemPrompt(outputLanguage);

  // Truncate text if it's too long (OpenAI has token limits)
  const maxLength = 4000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: truncatedText,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();

    // Extract token counts and calculate cost
    const promptTokens = data.usage.prompt_tokens;
    const completionTokens = data.usage.completion_tokens;
    const totalTokens = data.usage.total_tokens;

    // Calculate cost based on current OpenAI pricing (as of 2023)
    // GPT-3.5-turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
    const inputCost = (promptTokens / 1000) * 0.0015;
    const outputCost = (completionTokens / 1000) * 0.002;
    const totalCost = inputCost + outputCost;

    // Format the cost info
    const costInfo = {
      promptTokens,
      completionTokens,
      totalTokens,
      totalCost: totalCost.toFixed(5),
      provider: "openai",
    };

    return {
      summary: data.choices[0].message.content.trim(),
      costInfo: costInfo,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Generate summary using Anthropic API
async function generateAnthropicSummary(text, apiKey) {
  if (!apiKey) {
    throw new Error(
      "Anthropic API key not set. Please set it in the extension options."
    );
  }

  // Get user's preferred language
  const outputLanguage = getUserLanguage();

  // Get the system prompt
  const systemPrompt = getSystemPrompt(outputLanguage);

  // Truncate text if it's too long
  const maxLength = 4000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  try {
    console.log("Using Anthropic model: claude-3-haiku-20240307");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: truncatedText,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error response:", errorText);
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || "API request failed";
      } catch (e) {
        errorMessage = `API request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Anthropic API response:", data);

    // Calculate estimated tokens and cost for Anthropic
    // Claude-3 Haiku pricing
    const inputCostRate = 0.25; // per million tokens
    const outputCostRate = 1.25; // per million tokens

    const estimatedInputTokens = Math.round(truncatedText.length / 4);
    const estimatedOutputTokens = Math.round(data.content[0].text.length / 4);
    const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;

    const inputCost = (estimatedInputTokens / 1000000) * inputCostRate;
    const outputCost = (estimatedOutputTokens / 1000000) * outputCostRate;
    const totalCost = inputCost + outputCost;

    // Format the cost info
    const costInfo = {
      promptTokens: estimatedInputTokens,
      completionTokens: estimatedOutputTokens,
      totalTokens: estimatedTotalTokens,
      totalCost: totalCost.toFixed(5),
      provider: "anthropic",
      modelUsed: "claude-3-haiku-20240307",
      isEstimate: true,
    };

    return {
      summary: data.content[0].text.trim(),
      costInfo: costInfo,
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    throw error;
  }
}

// Show loading indicator
function showLoading(element) {
  const loadingContainer = document.createElement("div");
  loadingContainer.className = "tldr-loading-container";
  loadingContainer.style.cssText = `
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `;

  loadingContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center;">
      <div style="width: 24px; height: 24px; border: 3px solid #f3f3f3; 
                  border-top: 3px solid #3498db; border-radius: 50%; 
                  animation: tldr-spin 1s linear infinite;"></div>
      <div style="margin-left: 10px; font-weight: bold;">Generating summary...</div>
    </div>
    <style>
      @keyframes tldr-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // Check if we're on Twitter and the element is an article
  const isTwitter =
    window.location.hostname.includes("twitter.com") ||
    window.location.hostname.includes("x.com");

  if (isTwitter && element.tagName.toLowerCase() === "article") {
    // Insert the loading indicator before the article (as a sibling)
    element.parentNode.insertBefore(loadingContainer, element);
  } else {
    // For non-Twitter sites or non-article elements, insert at the top of the element
    element.insertBefore(loadingContainer, element.firstChild);
  }

  return loadingContainer;
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.5s";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Display the summary
async function displaySummary(element, summaryData) {
  // Get settings to check if we should show token cost
  const settings = await getAPISettings();

  // Create summary container
  const summaryContainer = document.createElement("div");
  summaryContainer.className = "tldr-summary-container";
  summaryContainer.style.cssText = `
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    position: relative;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
    max-height: 300px;
    overflow-y: auto;
  `;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.className = "tldr-close-button";
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
  `;
  closeButton.addEventListener("click", () => {
    summaryContainer.remove();
  });

  // Create the summary content
  const summaryContent = document.createElement("div");
  summaryContent.className = "tldr-content";
  summaryContent.textContent = summaryData.summary;
  summaryContent.style.cssText = `
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    padding-top: 16px;
    user-select: text;
  `;

  // Assemble the main elements
  summaryContainer.appendChild(closeButton);
  summaryContainer.appendChild(summaryContent);

  // Add token and cost info if enabled
  if (settings.showTokenCost) {
    const tokenInfo = document.createElement("div");
    tokenInfo.className = "tldr-token-info";
    tokenInfo.style.cssText = `
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #777;
      display: flex;
      justify-content: space-between;
    `;

    const {
      promptTokens,
      completionTokens,
      totalTokens,
      totalCost,
      provider,
      modelUsed,
      isEstimate,
    } = summaryData.costInfo;

    const providerName =
      provider === "anthropic"
        ? `Claude (${modelUsed || "Unknown model"})`
        : "GPT-3.5";
    const estimateText = isEstimate ? " (estimated)" : "";

    tokenInfo.innerHTML = `
      <div>Tokens${estimateText}: ${promptTokens} in + ${completionTokens} out = ${totalTokens} total</div>
      <div>${providerName} cost: $${totalCost}</div>
    `;

    summaryContainer.appendChild(tokenInfo);
  }

  // Check if we're on Twitter and the element is an article
  const isTwitter =
    window.location.hostname.includes("twitter.com") ||
    window.location.hostname.includes("x.com");

  if (isTwitter && element.tagName.toLowerCase() === "article") {
    // Insert the summary before the article (as a sibling)
    element.parentNode.insertBefore(summaryContainer, element);
  } else {
    // For non-Twitter sites or non-article elements, insert at the top of the element
    element.insertBefore(summaryContainer, element.firstChild);
  }

  // Add subtle animation
  summaryContainer.animate(
    [
      { opacity: 0, transform: "translateY(-10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: 300,
      easing: "ease-out",
    }
  );
}
