/**
 * ArcGIS Map Initialization
 * Modular and configurable map setup
 */

(function (window) {
  "use strict";

  /**
   * Map Configuration
   * @class
   */
  class MapConfig {
    constructor(options = {}) {
      this.containerId = options.containerId || "mapView";
      this.center = options.center || [106.6981295, 10.7711413];
      this.zoom = options.zoom || 16;
      this.basemap = options.basemap || "gray-vector";
      this.apiEndpoint = options.apiEndpoint || "/api/v1/sos-requests/";
      this.useMockData = options.useMockData !== false;
    }
  }

  /**
   * Map Renderer Configuration
   * @class
   */
  class MapRenderer {
    static getPopupTemplate() {
      return {
        title: "SOS Request #{id}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              { fieldName: "phone", label: "Phone Number" },
              { fieldName: "msg", label: "Message" },
              { fieldName: "status", label: "Status" },
              {
                fieldName: "time",
                label: "Request Time",
                format: { dateFormat: "short-date-short-time" },
              },
            ],
          },
        ],
      };
    }

    static getRenderer() {
      return {
        type: "unique-value",
        field: "status",
<<<<<<< HEAD
        title: "Tình trạng cứu hộ",
        uniqueValueInfos: [
          {
            value: "PENDING",
            symbol: {
              type: "simple-marker",
              color: "#e74c3c",
              size: 16,
              outline: { color: "white", width: 1 },
            },
            label: "Chưa hỗ trợ",
          },
          {
            value: "ASSIGNED",
            symbol: {
              type: "simple-marker",
              color: "#f39c12",
              size: 16,
              outline: { color: "white", width: 1 },
            },
            label: "Đang hỗ trợ",
          },
          {
            value: "RESOLVED",
            symbol: {
              type: "simple-marker",
              color: "#27ae60",
              size: 16,
              outline: { color: "white", width: 1 },
            },
            label: "Đã hỗ trợ",
=======
        defaultSymbol: {
          type: "simple-marker",
          color: "gray",
          size: 10,
        },
        uniqueValueInfos: [
          {
            value: "Open",
            symbol: {
              type: "simple-marker",
              color: "#F32013",
              size: 16,
              outline: { color: "white", width: 1 },
            },
            label: "Cần cứu trợ (Open)",
          },
          {
            value: "Closed",
            symbol: {
              type: "simple-marker",
              color: "#4BB543",
              size: 16,
              outline: { color: "white", width: 1 },
            },
            label: "Đã hỗ trợ (Closed)",
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
          },
        ],
      };
    }

    static getClusterConfig() {
      return {
        type: "cluster",
        clusterRadius: "100px",
        popupTemplate: {
          title: "Khu vực này có {cluster_count} người cần cứu",
          content: "Phóng to để xem chi tiết từng người.",
        },
        clusterMinSize: "24px",
        clusterMaxSize: "60px",
        labelingInfo: [
          {
            deconflictionStrategy: "none",
            labelExpressionInfo: {
              expression: "Text($feature.cluster_count, '#,###')",
            },
            symbol: {
              type: "text",
              color: "white",
              font: { weight: "bold", family: "Noto Sans", size: "12px" },
            },
            labelPlacement: "center-center",
          },
        ],
      };
    }
  }

  /**
   * Map Widgets Manager
   * @class
   */
  class MapWidgets {
    constructor(view) {
      this.view = view;
      this.timeSlider = null;
      this.legend = null;
    }

    /**
     * Initialize Time Slider
     * @param {Object} layer - GeoJSONLayer instance
     * @param {Object} TimeSlider - TimeSlider module
     */
    initTimeSlider(layer, TimeSlider) {
      if (!TimeSlider) return;

      this.timeSlider = new TimeSlider({
        container: document.createElement("div"),
        view: this.view,
        mode: "cumulative-from-start",
        timeVisible: true,
        loop: false,
      });

      this.view.ui.add(this.timeSlider, "bottom-leading");

      // Setup time extent when layer loads
      if (layer && layer.timeInfo) {
        this.view.whenLayerView(layer).then((layerView) => {
          const fullTimeExtent = layer.timeInfo.fullTimeExtent;
          if (fullTimeExtent) {
            this.timeSlider.fullTimeExtent = fullTimeExtent;
            this.timeSlider.stops = {
              interval: layer.timeInfo.interval,
            };
          }
        });
      }
    }

    /**
     * Initialize Legend
     * @param {Object} Legend - Legend module
     * @param {Object} Expand - Expand module
     */
    initLegend(Legend, Expand) {
      if (!Legend || !Expand) return;

      this.legend = new Legend({ view: this.view });
      const legendExpand = new Expand({
        view: this.view,
        content: this.legend,
        expanded: false,
        expandTooltip: "Legend",
      });
      this.view.ui.add(legendExpand, "top-left");
    }

    /**
     * Initialize all widgets
     * @param {Object} layer - GeoJSONLayer instance
     * @param {Object} TimeSlider - TimeSlider module
     * @param {Object} Legend - Legend module
     * @param {Object} Expand - Expand module
     */
    initAll(layer, TimeSlider, Legend, Expand) {
<<<<<<< HEAD
      // this.initTimeSlider(layer, TimeSlider);
=======
      this.initTimeSlider(layer, TimeSlider);
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      this.initLegend(Legend, Expand);
      this.view.ui.move("zoom", "bottom-right");
    }
  }

  /**
   * Map Controls Manager
   * @class
   */
  class MapControls {
    constructor(view, config) {
      this.view = view;
      this.config = config;
      this.map = null;
    }

    setMap(map) {
      this.map = map;
    }

    /**
     * Initialize basemap switcher
     */
    initBasemapSwitcher() {
      const basemapStylesDiv = document.getElementById("basemapStyles");
      const selectBasemap = document.getElementById("selectBasemap");
      const selectedBasemap =
        window.localStorage.getItem("selectedBasemap") || this.config.basemap;

      if (!basemapStylesDiv || !selectBasemap || !this.map) return;

      selectBasemap.value = selectedBasemap;
      this.map.basemap = selectedBasemap;

      selectBasemap.addEventListener("change", (event) => {
        this.map.basemap = event.target.value;
        window.localStorage.setItem("selectedBasemap", event.target.value);
      });

      this.view.ui.add(basemapStylesDiv, {
        position: "bottom-right",
      });
    }

    /**
     * Initialize map control buttons
     */
    initControlButtons() {
      const sidebarToggleBtn = document.getElementById("btn-toggle-sidebar");
      const refreshBtn = document.getElementById("btn-refresh-data");
      const locationBtn = document.getElementById("btn-my-location");
      const fullscreenBtn = document.getElementById("btn-fullscreen");

      if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener("click", () => {
          this.handleSidebarToggle();
        });
      }

      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.handleRefresh();
        });
      }

      if (locationBtn) {
        locationBtn.addEventListener("click", () => {
          this.handleGetLocation();
        });
      }

      if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
          this.handleFullscreen();
        });
      }
    }

    /**
     * Initialize search box
     */
    initSearchBox() {
      const searchTypeRadios = document.querySelectorAll(
        "input[name='search_type']"
      );
      const searchBoxInput = document.getElementById("search-box-input");
      const searchFiltersAreas = document.getElementById(
        "sidebar-filters__areas"
      );
      const searchFiltersPhone = document.getElementById(
        "sidebar-filters__phone"
      );

      searchTypeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          searchBoxInput.value = "";
<<<<<<< HEAD
=======
          console.log(radio.value);
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
          if (radio.value === "areas") {
            searchBoxInput.placeholder = "Tìm theo khu vực, phường/quận…";
            searchFiltersAreas.style.display = "block";
            searchFiltersPhone.style.display = "none";
          } else if (radio.value === "phone") {
            searchBoxInput.placeholder = "Tìm theo số điện thoại";
            searchFiltersPhone.style.display = "block";
            searchFiltersAreas.style.display = "none";
          }
        });
      });
    }

    /**
     * Initialize time filter
     */
    initTimeFilter() {
      const timeFilterCustomInputStart = document.getElementById(
        "time-filter__custom-input-start"
      );
      const timeFilterCustomInputEnd = document.getElementById(
        "time-filter__custom-input-end"
      );

      // Format date to YYYY-MM-DDTHH:mm for datetime-local input
      const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const maxDateTime = formatDateTimeLocal(today);

      timeFilterCustomInputStart.min = "1970-01-01T00:00";
      timeFilterCustomInputStart.max = maxDateTime;
      timeFilterCustomInputEnd.min = "1970-01-01T00:00";
      timeFilterCustomInputEnd.max = maxDateTime;
    }

<<<<<<< HEAD
    initSidebarFilters(data) {
      this.data = data;
      const groupByProperty = {
        status: {
          PENDING: 0,
          ASSIGNED: 0,
          RESOLVED: 0,
        },
        priority: {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
        },
      };

      this.data.features.forEach((feature) => {
        groupByProperty.status[feature.properties.status]++;
        groupByProperty.priority[feature.properties.priority]++;
      });

      const elementCountCritical = document.getElementById(
        "filter-group__count-critical"
      );
      const elementCountHigh = document.getElementById(
        "filter-group__count-high"
      );
      const elementCountMedium = document.getElementById(
        "filter-group__count-medium"
      );
      const elementCountAssigned = document.getElementById(
        "filter-group__count-assigned"
      );
      const elementCountResolved = document.getElementById(
        "filter-group__count-resolved"
      );
      const elementCountPending = document.getElementById(
        "filter-group__count-pending"
      );

      elementCountCritical.textContent = `(${
        groupByProperty.priority.CRITICAL ?? 0
      })`;
      elementCountHigh.textContent = `(${groupByProperty.priority.HIGH ?? 0})`;
      elementCountMedium.textContent = `(${
        groupByProperty.priority.MEDIUM ?? 0
      })`;
      elementCountAssigned.textContent = `(${
        groupByProperty.status.ASSIGNED ?? 0
      })`;
      elementCountResolved.textContent = `(${
        groupByProperty.status.RESOLVED ?? 0
      })`;
      elementCountPending.textContent = `(${
        groupByProperty.status.PENDING ?? 0
      })`;
    }

=======
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
    initClearAllTimeFilter() {
      const btnClearAllTimeFilter = document.getElementById(
        "btn-clear-all-time-filter"
      );

      if (btnClearAllTimeFilter) {
        btnClearAllTimeFilter.addEventListener("click", () => {
          this.handleClearAllTimeFilter();
        });
      }

      // Set up event listeners for all filter inputs to update button visibility
<<<<<<< HEAD
      const timeRangeRadios = document.querySelectorAll(
        'input[name="time_range"]'
      );
      const statusCheckboxes = document.querySelectorAll(
        'input[name="status"]'
      );
      const priorityCheckboxes = document.querySelectorAll(
        'input[name="priority"]'
      );
=======
      const timeRangeRadios = document.querySelectorAll('input[name="time_range"]');
      const statusCheckboxes = document.querySelectorAll('input[name="status"]');
      const priorityCheckboxes = document.querySelectorAll('input[name="priority"]');
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      const searchBoxInput = document.getElementById("search-box-input");
      const timeFilterCustomInputStart = document.getElementById(
        "time-filter__custom-input-start"
      );
      const timeFilterCustomInputEnd = document.getElementById(
        "time-filter__custom-input-end"
      );

      // Add change listeners to time range radios
      timeRangeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          this.updateClearAllButtonVisibility();
        });
      });

      // Add change listeners to status checkboxes
      statusCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          this.updateClearAllButtonVisibility();
        });
      });

      // Add change listeners to priority checkboxes
      priorityCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          this.updateClearAllButtonVisibility();
        });
      });

      // Add input listener to search box
      if (searchBoxInput) {
        searchBoxInput.addEventListener("input", () => {
          this.updateClearAllButtonVisibility();
        });
      }

      // Add input listeners to custom time inputs
      if (timeFilterCustomInputStart) {
        timeFilterCustomInputStart.addEventListener("input", () => {
          this.updateClearAllButtonVisibility();
        });
      }
      if (timeFilterCustomInputEnd) {
        timeFilterCustomInputEnd.addEventListener("input", () => {
          this.updateClearAllButtonVisibility();
        });
      }

      // Initial visibility check
      this.updateClearAllButtonVisibility();
    }

    /**
     * Handle sidebar toggle button click
     */
    handleSidebarToggle() {
      const sidebarOverlay = document.getElementById("sidebar-overlay");
      const sidebar = document.getElementById("sidebar");

      sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("sidebar--active");
      });

      if (sidebar) {
        sidebar.classList.toggle("sidebar--active");
      }
    }

    /**
     * Handle refresh button click
     */
    handleRefresh() {
      // Dispatch custom event for external handlers
      window.dispatchEvent(
        new CustomEvent("map:refresh", {
          detail: { view: this.view },
        })
      );
    }

    /**
     * Handle get location button click
     */
    handleGetLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.info("User location:", position.coords);
            this.view.goTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: this.config.zoom,
            });
          },
          (error) => {
            alert("Unable to get your location");
            console.error("Error getting user location:", error);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser");
      }
    }

    /**
     * Handle fullscreen button click
     */
    handleFullscreen() {
      const mapContainer =
        document.querySelector(".map-container") ||
        document.getElementById("map-container");

      if (!mapContainer) return;

      if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().catch((err) => {
          console.error("Fullscreen error:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }

    /**
     * Check if any filter has been set/selected
     */
    checkIfAnyFilterActive() {
      const timeFilterCustomInputStart = document.getElementById(
        "time-filter__custom-input-start"
      );
      const timeFilterCustomInputEnd = document.getElementById(
        "time-filter__custom-input-end"
      );
<<<<<<< HEAD
      const timeRangeRadios = document.querySelectorAll(
        'input[name="time_range"]'
      );
      const searchBoxInput = document.getElementById("search-box-input");
      const statusCheckboxes = document.querySelectorAll(
        'input[name="status"]'
      );
      const priorityCheckboxes = document.querySelectorAll(
        'input[name="priority"]'
      );
=======
      const timeRangeRadios = document.querySelectorAll('input[name="time_range"]');
      const searchBoxInput = document.getElementById("search-box-input");
      const statusCheckboxes = document.querySelectorAll('input[name="status"]');
      const priorityCheckboxes = document.querySelectorAll('input[name="priority"]');
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))

      // Check if custom time inputs have values
      if (timeFilterCustomInputStart && timeFilterCustomInputStart.value) {
        return true;
      }
      if (timeFilterCustomInputEnd && timeFilterCustomInputEnd.value) {
        return true;
      }

      // Check if time range is not "24" (default)
      let timeRangeSelected = false;
      timeRangeRadios.forEach((radio) => {
        if (radio.checked && radio.value !== "24") {
          timeRangeSelected = true;
        }
      });
      if (timeRangeSelected) {
        return true;
      }

      // Check if search box has value
      if (searchBoxInput && searchBoxInput.value.trim()) {
        return true;
      }

      // Check if any status checkbox is checked
      const hasStatusChecked = Array.from(statusCheckboxes).some(
        (checkbox) => checkbox.checked
      );
      if (hasStatusChecked) {
        return true;
      }

      // Check if any priority checkbox is checked
      const hasPriorityChecked = Array.from(priorityCheckboxes).some(
        (checkbox) => checkbox.checked
      );
      if (hasPriorityChecked) {
        return true;
      }

      return false;
    }

    /**
     * Update visibility of clear all button section
     */
    updateClearAllButtonVisibility() {
      const clearAllSection = document.getElementById(
        "sidebar__btn-clear-all-section"
      );
      if (!clearAllSection) return;

      const hasActiveFilters = this.checkIfAnyFilterActive();
      if (hasActiveFilters) {
        clearAllSection.classList.add("sidebar__btn-clear-all-section--active");
      } else {
        clearAllSection.classList.remove(
          "sidebar__btn-clear-all-section--active"
        );
      }
    }

    handleClearAllTimeFilter() {
      const timeFilterCustomInputStart = document.getElementById(
        "time-filter__custom-input-start"
      );
      const timeFilterCustomInputEnd = document.getElementById(
        "time-filter__custom-input-end"
      );
<<<<<<< HEAD
      const timeFilterTimeRange24 = document.querySelector(
        'input[name="time_range"][value="24"]'
      );
      const searchBoxInput = document.getElementById("search-box-input");
      const statusCheckboxes = document.querySelectorAll(
        'input[name="status"]'
      );
      const priorityCheckboxes = document.querySelectorAll(
        'input[name="priority"]'
      );
=======
      const timeFilterTimeRange24 = document.querySelector('input[name="time_range"][value="24"]');
      const searchBoxInput = document.getElementById("search-box-input");
      const statusCheckboxes = document.querySelectorAll('input[name="status"]');
      const priorityCheckboxes = document.querySelectorAll('input[name="priority"]');
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))

      // Clear custom time inputs
      if (timeFilterCustomInputStart) {
        timeFilterCustomInputStart.value = "";
      }
      if (timeFilterCustomInputEnd) {
        timeFilterCustomInputEnd.value = "";
      }
<<<<<<< HEAD

=======
      
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      // Clear search input
      if (searchBoxInput) {
        searchBoxInput.value = "";
      }
<<<<<<< HEAD

=======
      
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      // Uncheck all status checkboxes
      statusCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
<<<<<<< HEAD

=======
      
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      // Uncheck all priority checkboxes
      priorityCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
<<<<<<< HEAD

=======
      
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      // Set time range to "24 giờ"
      if (timeFilterTimeRange24) {
        timeFilterTimeRange24.checked = true;
      }

      // Update button visibility after clearing
      this.updateClearAllButtonVisibility();
    }

    /**
     * Initialize all controls
     */
<<<<<<< HEAD
    initAll(data = null) {
=======
    initAll() {
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      this.initBasemapSwitcher();
      this.initControlButtons();
      this.initSearchBox();
      this.initTimeFilter();
<<<<<<< HEAD
      this.initSidebarFilters(data);
=======
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      this.initClearAllTimeFilter();
    }
  }

  /**
   * Main Map Manager
   * @class
   */
  class RescueMap {
    constructor(config = {}) {
      this.config = new MapConfig(config);
      this.dataService = null;
      this.map = null;
      this.view = null;
      this.layer = null;
      this.widgets = null;
      this.controls = null;
      this.blobURL = null;
<<<<<<< HEAD
      this.data = null;
=======
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
    }

    /**
     * Initialize the map
     * @param {Object} dataService - GISDataService instance
     * @returns {Promise<void>}
     */
    async init(dataService = null) {
      // Initialize data service
      if (!dataService) {
        const GISDataService = window.GISDataService;
        if (!GISDataService) {
          throw new Error(
            "GISDataService is required. Make sure gis-data.js is loaded."
          );
        }
        this.dataService = new GISDataService({
          apiEndpoint: this.config.apiEndpoint,
          useMockData: this.config.useMockData,
        });
      } else {
        this.dataService = dataService;
      }

      // Load ArcGIS modules
      const modules = await this.loadArcGISModules();
      const { Map, MapView, GeoJSONLayer } = modules;

      // Get data
<<<<<<< HEAD
      this.data = await this.dataService.getData();

      // Create blob URL for GeoJSONLayer
      this.blobURL = this.dataService.createBlobURL(this.data);
=======
      const geoJsonData = await this.dataService.getData();

      // Create blob URL for GeoJSONLayer
      this.blobURL = this.dataService.createBlobURL(geoJsonData);
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))

      // Create layer
      this.layer = new GeoJSONLayer({
        url: this.blobURL,
<<<<<<< HEAD
        title: "Tình trạng cứu hộ",
=======
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
        copyright: "HCMC Rescue Data",
        popupTemplate: MapRenderer.getPopupTemplate(),
        renderer: MapRenderer.getRenderer(),
        timeInfo: {
          startField: "time",
          interval: {
            unit: "days",
            value: 1,
          },
        },
        featureReduction: MapRenderer.getClusterConfig(),
      });

      // Create map
      this.map = new Map({
        basemap: this.config.basemap,
        layers: [this.layer],
      });

      // Create view
      this.view = new MapView({
        container: this.config.containerId,
        map: this.map,
        center: this.config.center,
        zoom: this.config.zoom,
      });

      // Initialize widgets
      this.widgets = new MapWidgets(this.view);
      this.widgets.initAll(
        this.layer,
        modules.TimeSlider,
        modules.Legend,
        modules.Expand
      );

      // Initialize controls
      this.controls = new MapControls(this.view, this.config);
      this.controls.setMap(this.map);
<<<<<<< HEAD
      this.controls.initAll(this.data);
=======
      this.controls.initAll();
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))

      // Wait for view to load
      await this.view.when();

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent("map:ready", {
          detail: { map: this.map, view: this.view, layer: this.layer },
        })
      );

      return this;
    }

    /**
     * Load ArcGIS modules using require
     * @returns {Promise<Object>} Loaded modules
     */
    loadArcGISModules() {
      return new Promise((resolve, reject) => {
        if (typeof require === "undefined") {
          reject(
            new Error(
              "ArcGIS API is not loaded. Make sure the script is included."
            )
          );
          return;
        }

        require([
          "esri/Map",
          "esri/views/MapView",
          "esri/layers/GeoJSONLayer",
          "esri/widgets/TimeSlider",
          "esri/widgets/Legend",
          "esri/widgets/Expand",
        ], function (Map, MapView, GeoJSONLayer, TimeSlider, Legend, Expand) {
          resolve({ Map, MapView, GeoJSONLayer, TimeSlider, Legend, Expand });
        }, function (error) {
          reject(new Error("Failed to load ArcGIS modules: " + error));
        });
      });
    }

    /**
     * Refresh map data
     * @returns {Promise<void>}
     */
    async refresh() {
      if (!this.dataService || !this.layer) return;

      const geoJsonData = await this.dataService.getData({ useMock: false });

      // Revoke old blob URL
      if (this.blobURL) {
        this.dataService.revokeBlobURL(this.blobURL);
      }

      // Create new blob URL
      this.blobURL = this.dataService.createBlobURL(geoJsonData);

      // Update layer URL
      this.layer.url = this.blobURL;
    }

    /**
     * Destroy map and clean up resources
     */
    destroy() {
      if (this.blobURL) {
        this.dataService.revokeBlobURL(this.blobURL);
      }

      if (this.view) {
        this.view.destroy();
      }

      this.map = null;
      this.view = null;
      this.layer = null;
      this.widgets = null;
      this.controls = null;
      this.blobURL = null;
    }
  }

  // Export for use in other modules
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      RescueMap,
      MapConfig,
      MapRenderer,
      MapWidgets,
      MapControls,
    };
  } else {
    window.RescueMap = RescueMap;
    window.MapConfig = MapConfig;
    window.MapRenderer = MapRenderer;
    window.MapWidgets = MapWidgets;
    window.MapControls = MapControls;
  }

  // Auto-initialize if DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMap);
  } else {
    initializeMap();
  }

  /**
   * Auto-initialize map if container exists
   */
  function initializeMap() {
    const mapContainer = document.getElementById("mapView");
    if (mapContainer && window.RescueMap && window.GISDataService) {
<<<<<<< HEAD
      const map = new RescueMap({
        apiEndpoint: "http://127.0.0.1:8000/api/sos",
        useMockData: false,
      });
=======
      const map = new RescueMap();
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      map.init().catch((error) => {
        console.error("Failed to initialize map:", error);
      });
    }
  }
})(window);
