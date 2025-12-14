/**
 * GIS Data Service
 * Handles fetching and managing GIS data for the map
 * Supports both API and fallback mock data
 */

(function (window) {
  "use strict";

  /**
   * GIS Data Service
   * @class
   */
  class GISDataService {
    constructor(config = {}) {
<<<<<<< HEAD
      this.apiEndpoint =
        config.apiEndpoint || "http://127.0.0.1:8000/api/v1/sos";
      this.useMockData = config.useMockData === true; // Default to false (use API) if not specified
=======
      this.apiEndpoint = config.apiEndpoint || "/api/v1/sos-requests/";
      this.useMockData = config.useMockData !== false; // Default to true if not specified
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
      this.mockData = config.mockData || this.getDefaultMockData();
    }

    /**
     * Get default mock data for development/testing
     * @returns {Object} GeoJSON FeatureCollection
     */
    getDefaultMockData() {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [106.7, 10.776] },
            properties: {
              id: 1,
              phone: "0909xxx001",
              msg: "Nước dâng cao",
              status: "Open",
              time: 1700000000000,
            },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [106.705, 10.78] },
            properties: {
              id: 2,
              phone: "0909xxx002",
              msg: "Cần lương thực",
              status: "Closed",
              time: 1700086400000,
            },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [106.701, 10.777] },
            properties: {
              id: 3,
              phone: "0909xxx003",
              msg: "Bị thương nhẹ",
              status: "Open",
              time: 1700172800000,
            },
          },
        ],
      };
    }

<<<<<<< HEAD
    transformToFeatures(data) {
      return data.map((item) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.longitude, item.latitude],
        },
        properties: {
          id: item.request_id,
          address: item.address,
          contact_name: item.contact_name,
          phone: item.contact_phone,
          priority: item.priority,
          status: item.status,
          created_at: item.created_at,
        },
      }));
    }

=======
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
    /**
     * Fetch data from API
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} GeoJSON FeatureCollection
     */
    async fetchFromAPI(params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString
          ? `${this.apiEndpoint}?${queryString}`
          : this.apiEndpoint;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Ensure data is in GeoJSON format
        if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
          return data;
        }

        // If API returns array, convert to GeoJSON
        if (Array.isArray(data)) {
          return {
            type: "FeatureCollection",
<<<<<<< HEAD
            features: this.transformToFeatures(data),
=======
            features: data,
>>>>>>> 36b8327 (Feature/phuc b gis map (#8))
          };
        }

        throw new Error("Invalid data format received from API");
      } catch (error) {
        console.error("Error fetching data from API:", error);
        throw error;
      }
    }

    /**
     * Get GIS data (from API or mock)
     * @param {Object} options - Options for fetching data
     * @returns {Promise<Object>} GeoJSON FeatureCollection
     */
    async getData(options = {}) {
      const { useMock = this.useMockData, params = {} } = options;

      if (useMock) {
        return Promise.resolve(this.mockData);
      }

      try {
        return await this.fetchFromAPI(params);
      } catch (error) {
        console.warn("API fetch failed, falling back to mock data:", error);
        return this.mockData;
      }
    }

    /**
     * Create a Blob URL from GeoJSON data for ArcGIS GeoJSONLayer
     * @param {Object} geoJsonData - GeoJSON FeatureCollection
     * @returns {string} Blob URL
     */
    createBlobURL(geoJsonData) {
      const blob = new Blob([JSON.stringify(geoJsonData)], {
        type: "application/json",
      });
      return URL.createObjectURL(blob);
    }

    /**
     * Revoke a Blob URL to free memory
     * @param {string} url - Blob URL to revoke
     */
    revokeBlobURL(url) {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }
  }

  // Export for use in other modules
  if (typeof module !== "undefined" && module.exports) {
    module.exports = GISDataService;
  } else {
    window.GISDataService = GISDataService;
  }
})(window);
