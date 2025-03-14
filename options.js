// Toggle API provider sections based on selection
function toggleApiSections() {
  const selectedProvider = document.querySelector(
    'input[name="aiProvider"]:checked'
  ).value;

  // Toggle visibility based on selection
  if (selectedProvider === "openai") {
    document
      .getElementById("openai-container")
      .classList.remove("hidden-field");
    document
      .getElementById("anthropic-container")
      .classList.add("hidden-field");
  } else {
    document.getElementById("openai-container").classList.add("hidden-field");
    document
      .getElementById("anthropic-container")
      .classList.remove("hidden-field");
  }
}

// Save options to Chrome storage
function saveOptions() {
  const openaiApiKey = document.getElementById("openaiApiKey").value.trim();
  const anthropicApiKey = document
    .getElementById("anthropicApiKey")
    .value.trim();
  const aiProvider = document.querySelector(
    'input[name="aiProvider"]:checked'
  ).value;
  const showTokenCost = document.getElementById("showTokenCost").checked;

  chrome.storage.sync.set(
    {
      openaiApiKey,
      anthropicApiKey,
      aiProvider,
      showTokenCost,
    },
    function () {
      // Update status to let user know options were saved
      const status = document.getElementById("status");
      status.textContent = "Settings saved!";
      status.style.display = "block";

      setTimeout(function () {
        status.style.display = "none";
      }, 3000);
    }
  );
}

// Restore saved settings when opening options page
function restoreOptions() {
  chrome.storage.sync.get(
    {
      openaiApiKey: "",
      anthropicApiKey: "",
      aiProvider: "openai",
      showTokenCost: true,
    },
    function (items) {
      // Restore API keys
      document.getElementById("openaiApiKey").value = items.openaiApiKey;
      document.getElementById("anthropicApiKey").value = items.anthropicApiKey;

      // Restore AI provider selection
      const providerRadio = document.querySelector(
        `input[name="aiProvider"][value="${items.aiProvider}"]`
      );
      if (providerRadio) {
        providerRadio.checked = true;
      }

      // Restore show token cost preference
      document.getElementById("showTokenCost").checked = items.showTokenCost;

      // Update UI based on restored settings
      toggleApiSections();
    }
  );
}

// Add event listeners
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

// Add listener for API provider change
const providerRadios = document.querySelectorAll('input[name="aiProvider"]');
providerRadios.forEach((radio) => {
  radio.addEventListener("change", toggleApiSections);
});
