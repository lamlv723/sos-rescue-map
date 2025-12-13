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
      this.initTimeSlider(layer, TimeSlider);
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
      const searchTypeRadios = document.querySelectorAll("input[name='search_type']");
      const searchBoxInput = document.getElementById("search-box-input");
      const searchBtn = document.getElementById("btn-find");

      searchTypeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          searchBoxInput.value = "";
          if (radio.value === "address") {
            searchBoxInput.placeholder = "Tìm theo khu vực, phường/quận…";
          } else if (radio.value === "phone") {
            searchBoxInput.placeholder = "Tìm theo số điện thoại";
          }
        });
      });
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
     * Initialize all controls
     */
    initAll() {
      this.initBasemapSwitcher();
      this.initControlButtons();
      this.initSearchBox();
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
      const geoJsonData = await this.dataService.getData();

      // Create blob URL for GeoJSONLayer
      this.blobURL = this.dataService.createBlobURL(geoJsonData);

      // Create layer
      this.layer = new GeoJSONLayer({
        url: this.blobURL,
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
      this.controls.initAll();

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
      const map = new RescueMap();
      map.init().catch((error) => {
        console.error("Failed to initialize map:", error);
      });
    }
  }
})(window);
