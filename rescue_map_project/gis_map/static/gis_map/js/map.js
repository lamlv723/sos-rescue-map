require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/GeoJSONLayer", // Dùng GeoJSONLayer thay vì FeatureLayer thủ công
  "esri/widgets/TimeSlider",
  "esri/widgets/Legend",
  "esri/widgets/Expand"
], function (Map, MapView, GeoJSONLayer, TimeSlider, Legend, Expand) {

  // --- 1. SIMULATE API RESPONSE ---
  // Trong thực tế, đây là response từ REST API của bạn (ví dụ: /api/v1/sos-requests)
  // Chuẩn GeoJSON: FeatureCollection
  const geoJsonData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [106.700, 10.776] },
        properties: { id: 1, phone: "0909xxx001", msg: "Nước dâng cao", status: "Open", time: 1700000000000 } // Unix Timestamp
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [106.705, 10.780] },
        properties: { id: 2, phone: "0909xxx002", msg: "Cần lương thực", status: "Closed", time: 1700086400000 }
      },
      {
        type: "Feature", // Giả lập điểm gần điểm 1 để test Clustering
        geometry: { type: "Point", coordinates: [106.701, 10.777] },
        properties: { id: 3, phone: "0909xxx003", msg: "Bị thương nhẹ", status: "Open", time: 1700172800000 }
      },
      // ... more data
    ]
  };

  // Tạo URL giả lập (Blob URL) để GeoJSONLayer có thể đọc như một file online
  const blob = new Blob([JSON.stringify(geoJsonData)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // --- 2. GIS CONFIGURATION PART ---

  // Popup Template
  const template = {
    title: "SOS Request #{id}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          { fieldName: "phone", label: "Phone Number" },
          { fieldName: "msg", label: "Message" },
          { fieldName: "status", label: "Status" },
          { fieldName: "time", label: "Request Time", format: { dateFormat: "short-date-short-time" } }
        ]
      }
    ]
  };

// Renderer: Sử dụng UniqueValueRenderer cho dữ liệu dạng phân loại (Category/String)
const renderer = {
  type: "unique-value", // Đổi từ 'simple' sang 'unique-value'
  field: "status",      // Trường dữ liệu dùng để phân loại
  defaultSymbol: {      // (Tùy chọn) Symbol mặc định nếu status không khớp
    type: "simple-marker", 
    color: "gray", 
    size: 10
  },
  uniqueValueInfos: [
    {
      value: "Open", // Giá trị trong dữ liệu (Case sensitive)
      symbol: {
        type: "simple-marker",
        color: "#F32013", // Màu Đỏ
        size: 15,
        outline: { color: "white", width: 1 }
      },
      label: "Cần cứu trợ (Open)" // Label hiển thị trên Legend
    },
    {
      value: "Closed",
      symbol: {
        type: "simple-marker",
        color: "#4BB543", // Màu Xanh
        size: 15,
        outline: { color: "white", width: 1 }
      },
      label: "Đã hỗ trợ (Closed)"
    }
  ]
};

  // Clustering Configuration
  const clusterConfig = {
    type: "cluster",
    clusterRadius: "100px", // Cluster radius
    popupTemplate: {
      title: "Khu vực này có {cluster_count} người cần cứu",
      content: "Phóng to để xem chi tiết từng người."
    },
    clusterMinSize: "24px",
    clusterMaxSize: "60px",
    labelingInfo: [{
      deconflictionStrategy: "none",
      labelExpressionInfo: { expression: "Text($feature.cluster_count, '#,###')" },
      symbol: {
        type: "text",
        color: "white",
        font: { weight: "bold", family: "Noto Sans", size: "12px" }
      },
      labelPlacement: "center-center",
    }]
  };

  // --- 3. LAYER INITIALIZATION ---
  const layer = new GeoJSONLayer({
    url: url, // Load from Blob URL
    copyright: "HCMC Rescue Data",
    popupTemplate: template,
    renderer: renderer,
    timeInfo: {
      startField: "time",
      interval: {
        unit: "days",
        value: 1
      }
    },
    featureReduction: clusterConfig // Bật tính năng Clustering
  });

  const map = new Map({
    basemap: "satellite",
    layers: [layer]
  });

  const view = new MapView({
    container: "mapView",
    map: map,
    center: [106.700, 10.776],
    zoom: 14
  });

  // --- 4. WIDGETS INTEGRATION (Standard GIS UI) ---

  const timeSlider = new TimeSlider({
    container: document.createElement("div"),
    view: view,
    mode: "cumulative-from-start",
    timeVisible: true,
    loop: false
  });

  view.ui.add(timeSlider, "bottom-leading");

  // Let layer load finish then setup for TimeSlider
  view.whenLayerView(layer).then((layerView) => {
    const fullTimeExtent = layer.timeInfo.fullTimeExtent;
    
    timeSlider.fullTimeExtent = fullTimeExtent;
    timeSlider.stops = {
      interval: layer.timeInfo.interval
    };
  });

  // Legend
  const legend = new Legend({ view: view });
  const legendExpand = new Expand({ view: view, content: legend, expanded: true });
  view.ui.add(legendExpand, "top-right");

  // --- 5. BASEMAP SWITCHER (COMBOBOX) ---
  
  // Lấy thẻ div chứa combobox từ HTML
  const basemapStylesDiv = document.getElementById("basemapStyles");
  const selectBasemap = document.getElementById("selectBasemap");

  // Hiển thị div lên (do ban đầu mình set display: none để tránh bị lệch layout khi chưa load map)
  basemapStylesDiv.style.display = "block";

  // Lắng nghe sự kiện khi người dùng chọn item khác trong combobox
  selectBasemap.addEventListener("change", (event) => {
    // Gán basemap mới cho map
    map.basemap = event.target.value;
  });

  // Đưa combobox vào giao diện bản đồ (Góc trên bên phải, nằm dưới Legend)
  view.ui.add(basemapStylesDiv, {
    position: "bottom-right"
  });

});