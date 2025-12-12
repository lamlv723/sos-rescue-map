const gisData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.7, 10.776] },
      properties: {
        id: 1,
        phone: '0909xxx001',
        msg: 'Nước dâng cao',
        status: 'Open',
        time: 1700000000000,
      }, // Unix Timestamp
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.705, 10.78] },
      properties: {
        id: 2,
        phone: '0909xxx002',
        msg: 'Cần lương thực',
        status: 'Closed',
        time: 1700086400000,
      },
    },
    {
      type: 'Feature', // Giả lập điểm gần điểm 1 để test Clustering
      geometry: { type: 'Point', coordinates: [106.701, 10.777] },
      properties: {
        id: 3,
        phone: '0909xxx003',
        msg: 'Bị thương nhẹ',
        status: 'Open',
        time: 1700172800000,
      },
    },
  ],
};
