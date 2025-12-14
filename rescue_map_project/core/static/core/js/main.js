/**
 * RESCUE MAP - MAIN JAVASCRIPT
 * BEM Methodology for class names
 * Placeholder functions for prototype
 */

// ========================================
// GLOBAL STATE
// ========================================
const AppState = {
  currentUser: null,
  mapView: null,
  filters: {
    status: ["Open", "Processing"],
    priority: ["Critical", "High", "Medium"],
    timeRange: "last_hour",
  },
  currentFormStep: 1,
  formData: {},
};

// ========================================
// FOOTER YEAR
// ========================================
const footerYear = document.getElementById("footer__year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ========================================
// HEADER FUNCTIONALITY
// ========================================

// Mobile menu toggle
function initMobileMenu() {
  const menuToggle = document.querySelector(".header__menu-toggle");
  const nav = document.querySelector(".header__nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("header__nav--active");
    });
  }
}

// ========================================
// DASHBOARD PAGE FUNCTIONALITY
// ========================================

function initDashboard() {
  console.log("Dashboard initialized");

  // Placeholder: Initialize charts
  initCharts();

  // Export report button
  const exportBtn = document.querySelector(".dashboard__export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportReport);
  }

  // Period selector
  const periodSelect = document.querySelector(".dashboard__period-select");
  if (periodSelect) {
    periodSelect.addEventListener("change", (e) => {
      console.log("Period changed:", e.target.value);
      refreshDashboardData();
    });
  }
}

function initCharts() {
  console.log("Initializing charts...");
  // Placeholder: Initialize Chart.js or D3.js charts
  // Example: new Chart(ctx, { type: 'line', data: {...} });
}

function refreshDashboardData() {
  console.log("Refreshing dashboard data...");
  // Placeholder: Fetch new data from API and update charts
}

function exportReport() {
  console.log("Exporting report...");
  // Placeholder: Generate PDF or CSV report
  alert("Report export functionality coming soon!");
}

// ========================================
// SUBMIT SOS FORM FUNCTIONALITY
// ========================================

function initSubmitForm() {
  const form = document.querySelector(".sos-form");

  if (!form) return;

  // Step navigation
  initFormSteps();

  // Location detection
  initLocationDetection();

  // Priority selector
  initPrioritySelector();

  // File upload
  initFileUpload();

  // Form submission
  form.addEventListener("submit", handleFormSubmit);
}

function initFormSteps() {
  const nextBtns = document.querySelectorAll(".form-btn--primary");
  const prevBtns = document.querySelectorAll(".form-btn--secondary");
  const submitBtn = document.querySelector(".form-btn--emergency");

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateCurrentStep()) {
        goToNextStep();
      }
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", goToPreviousStep);
  });
}

function goToNextStep() {
  const currentSection = document.querySelector(".form-section--active");
  const nextSection = currentSection.nextElementSibling;

  if (nextSection && nextSection.classList.contains("form-section")) {
    currentSection.classList.remove("form-section--active");
    nextSection.classList.add("form-section--active");

    AppState.currentFormStep++;
    updateStepIndicator();

    // Show submit button on last step
    if (AppState.currentFormStep === 4) {
      document.querySelector(".form-btn--primary").style.display = "none";
      document.querySelector(".form-btn--emergency").style.display = "block";
    }
  }
}

function goToPreviousStep() {
  const currentSection = document.querySelector(".form-section--active");
  const prevSection = currentSection.previousElementSibling;

  if (prevSection && prevSection.classList.contains("form-section")) {
    currentSection.classList.remove("form-section--active");
    prevSection.classList.add("form-section--active");

    AppState.currentFormStep--;
    updateStepIndicator();

    // Hide submit button if not on last step
    if (AppState.currentFormStep < 4) {
      document.querySelector(".form-btn--primary").style.display = "block";
      document.querySelector(".form-btn--emergency").style.display = "none";
    }
  }
}

function updateStepIndicator() {
  const steps = document.querySelectorAll(".form-steps__item");

  steps.forEach((step, index) => {
    if (index < AppState.currentFormStep) {
      step.classList.add("form-steps__item--active");
    } else {
      step.classList.remove("form-steps__item--active");
    }
  });
}

function validateCurrentStep() {
  // Placeholder: Validate current form step
  const currentSection = document.querySelector(".form-section--active");
  const requiredInputs = currentSection.querySelectorAll("[required]");

  for (let input of requiredInputs) {
    if (!input.value) {
      alert("Please fill in all required fields");
      return false;
    }
  }

  return true;
}

function initLocationDetection() {
  const detectBtn = document.querySelector(".btn-detect-location");

  if (detectBtn) {
    detectBtn.addEventListener("click", () => {
      detectBtn.textContent = "🔄 Detecting...";

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Location detected:", latitude, longitude);

            // Placeholder: Reverse geocode to get address
            // In production: Use ArcGIS geocoding service

            detectBtn.textContent = "✓ Location Detected";
            detectBtn.style.backgroundColor = "#27AE60";

            // Auto-fill address field
            setTimeout(() => {
              document.querySelector(
                ".form-input"
              ).value = `${latitude}, ${longitude}`;
            }, 500);
          },
          (error) => {
            alert("Unable to detect location. Please enter manually.");
            detectBtn.textContent = "🎯 Detect My Location";
          }
        );
      } else {
        alert("Geolocation is not supported by your browser");
        detectBtn.textContent = "🎯 Detect My Location";
      }
    });
  }
}

function initPrioritySelector() {
  const priorityItems = document.querySelectorAll(".priority-selector__item");

  priorityItems.forEach((item) => {
    item.addEventListener("click", () => {
      priorityItems.forEach((i) => {
        i.querySelector("input").checked = false;
        i.style.borderColor = "var(--color-light-gray)";
      });

      item.querySelector("input").checked = true;
      item.style.borderColor = "var(--color-primary)";
    });
  });
}

function initFileUpload() {
  const fileInput = document.querySelector('.file-upload input[type="file"]');
  const placeholder = document.querySelector(".file-upload__placeholder");

  if (fileInput && placeholder) {
    fileInput.addEventListener("change", (e) => {
      const files = e.target.files;

      if (files.length > 0) {
        placeholder.innerHTML = `
                    <span class="file-upload__icon">✓</span>
                    <span>${files.length} file(s) selected</span>
                `;
        placeholder.style.borderColor = "var(--color-success)";
        placeholder.style.backgroundColor = "rgba(39, 174, 96, 0.1)";
      }
    });
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  console.log("Submitting SOS request...", AppState.formData);

  // Placeholder: Send data to API
  // In production: POST to /api/v1/sos-requests

  // Show success message
  if (
    confirm(
      "Your SOS request has been submitted successfully! Emergency teams will be notified immediately."
    )
  ) {
    window.location.href = "index.html";
  }
}

// ========================================
// RESOURCES PAGE FUNCTIONALITY
// ========================================

function initResourcesPage() {
  // Search functionality
  const searchBtn = document.querySelector(".resources-filter__btn");
  const searchInput = document.querySelector(".resources-filter__input");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      searchResources(searchInput.value);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchResources(searchInput.value);
      }
    });
  }

  // Filter tabs
  const filterTabs = document.querySelectorAll(".resources-filter__tab");
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) =>
        t.classList.remove("resources-filter__tab--active")
      );
      tab.classList.add("resources-filter__tab--active");

      filterResourcesByType(tab.textContent);
    });
  });

  // Resource card actions
  initResourceCardActions();

  // Map toggle
  const mapToggle = document.querySelector(".resources-map__toggle");
  if (mapToggle) {
    mapToggle.addEventListener("click", () => {
      console.log("Toggle map/list view");
    });
  }
}

function searchResources(query) {
  console.log("Searching resources:", query);
  // Placeholder: Filter resources by search query
}

function filterResourcesByType(type) {
  console.log("Filtering by type:", type);
  // Placeholder: Show/hide resource sections based on type
}

function initResourceCardActions() {
  const callBtns = document.querySelectorAll(".resource-card__btn--primary");
  const directionBtns = document.querySelectorAll(
    ".resource-card__btn--secondary"
  );

  callBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".resource-card");
      const name = card.querySelector(".resource-card__name").textContent;

      console.log("Calling:", name);
      // Placeholder: Initiate phone call or show contact modal
      alert(`Calling ${name}...`);
    });
  });

  directionBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".resource-card");
      const name = card.querySelector(".resource-card__name").textContent;

      console.log("Getting directions to:", name);
      // Placeholder: Open map with directions
    });
  });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Rescue Map initialized");

  // Common initializations for all pages
  initMobileMenu();

  // Page-specific initializations
  const currentPage = window.location.pathname.split("/").pop();

  switch (currentPage) {
    case "dashboard.html":
      initDashboard();
      break;

    case "submit.html":
      initSubmitForm();
      break;

    case "resources.html":
      initResourcesPage();
      break;
  }
});

// Export for use in other modules if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AppState, initDashboard, initSubmitForm };
}
