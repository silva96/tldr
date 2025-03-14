// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Popup DOM fully loaded");

  // Find the options link
  const optionsLink = document.getElementById("options-link");

  if (!optionsLink) {
    console.error("Options link not found in the popup");
    return;
  }

  // Add click handler for options link
  optionsLink.addEventListener("click", function () {
    console.log("Options link clicked");
    openOptionsPage();
  });

  // Try multiple methods to open the options page
  function openOptionsPage() {
    // Method 1: The standard way
    console.log("Trying primary method to open options page");
    try {
      chrome.runtime.openOptionsPage(function () {
        if (chrome.runtime.lastError) {
          console.error(
            "Error in openOptionsPage callback:",
            chrome.runtime.lastError
          );
          openOptionsWithTabs();
        }
      });
    } catch (error) {
      console.error("Exception in openOptionsPage:", error);
      openOptionsWithTabs();
    }
  }

  // Method 2: Using chrome.tabs API
  function openOptionsWithTabs() {
    console.log("Trying to open options using chrome.tabs.create");
    try {
      // Get extension ID for constructing the options URL
      const extensionId = chrome.runtime.id;
      const optionsUrl = `chrome-extension://${extensionId}/options.html`;

      chrome.tabs.create({ url: optionsUrl }, function (tab) {
        if (chrome.runtime.lastError) {
          console.error(
            "Error in tabs.create callback:",
            chrome.runtime.lastError
          );
          showError();
        } else {
          console.log("Options page opened in new tab:", tab);
        }
      });
    } catch (error) {
      console.error("Exception in openOptionsWithTabs:", error);
      showError();
    }
  }

  // Show error message if all methods fail
  function showError() {
    console.error("Failed to open options with any method");
    alert(
      "Could not open options page. Please try again or restart the browser."
    );
  }
});
