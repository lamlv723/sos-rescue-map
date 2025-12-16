document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard loaded. Fetching Mock APIs...");
    
    fetchSummary();
    fetchTimeline();
    fetchDistributions();
    fetchResources();
    fetchDistrictStats();  // Mới
    fetchResponseTime();   // Mới
});

const DATA_PATH = '/static/analytics/data/';

// --- 1. API Summary (KPIs) ---
function fetchSummary() {
    fetch(DATA_PATH + 'api_summary.json')
        .then(res => res.json())
        .then(data => {
            updateKPI('kpi-total', data.total_requests);
            updateKPI('kpi-active', data.active_requests);
            updateKPI('kpi-processing', data.processing_requests);
            updateKPI('kpi-resolved', data.resolved_today);

            updateTrend('trend-total', data.trends.total);
            updateTrend('trend-active', data.trends.active);
            updateTrend('trend-processing', data.trends.processing);
            updateTrend('trend-resolved', data.trends.resolved);
        });
}

function updateKPI(id, value) {
    document.getElementById(id).textContent = value.toLocaleString('vi-VN');
}

function updateTrend(elementId, value) {
    const el = document.getElementById(elementId);
    const icon = value > 0 ? '↑' : (value < 0 ? '↓' : '→');
    const colorClass = value > 0 ? 'bg-success text-white' : (value < 0 ? 'bg-danger text-white' : 'bg-secondary text-white');
    
    // Xóa class cũ và thêm class mới
    el.className = `badge ${colorClass}`;
    el.textContent = `${icon} ${Math.abs(value)}% so với hôm qua`;
}

// --- 2. API Timeline ---
function fetchTimeline() {
    fetch(DATA_PATH + 'api_timeline.json')
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('timelineChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Số yêu cầu mới',
                        data: data.values,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        });
}

// --- 3. API Distributions (Status & Priority) ---
function fetchDistributions() {
    fetch(DATA_PATH + 'api_distributions.json')
        .then(res => res.json())
        .then(data => {
            // Status Chart
            // Việt hóa labels nếu cần thiết ngay tại đây hoặc trong JSON
            const statusLabelsVi = ["Mới", "Đang xử lý", "Hoàn thành"]; 
            
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: statusLabelsVi, 
                    datasets: [{
                        data: data.status.values,
                        backgroundColor: data.status.colors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });

            // Priority Chart
            const priorityCtx = document.getElementById('priorityChart').getContext('2d');
            new Chart(priorityCtx, {
                type: 'bar',
                data: {
                    labels: ["Khẩn cấp", "Cao", "Trung bình", "Thường"], // Việt hóa
                    datasets: [{
                        label: 'Số lượng',
                        data: data.priority.values,
                        backgroundColor: data.priority.colors,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } }
                }
            });
        });
}

// --- 4. API Resources ---
function fetchResources() {
    fetch(DATA_PATH + 'api_resources.json')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('resourceTableBody');
            tbody.innerHTML = '';
            
            const typeMap = {
                "Ambulance": "Xe Cứu Thương",
                "Rescue Boat": "Xuồng Cứu Hộ",
                "Helicopter": "Trực Thăng",
                "Rescue Team": "Đội Cứu Hộ"
            };

            data.forEach(item => {
                let badgeClass = 'bg-success';
                if(item.utilization > 80) badgeClass = 'bg-danger';
                else if(item.utilization > 50) badgeClass = 'bg-warning text-dark';

                const row = `
                    <tr>
                        <td class="ps-3 fw-bold text-secondary">${typeMap[item.type] || item.type}</td>
                        <td>${item.total}</td>
                        <td>${item.available}</td>
                        <td class="pe-3">
                            <div class="d-flex align-items-center">
                                <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                    <div class="progress-bar ${badgeClass}" role="progressbar" 
                                         style="width: ${item.utilization}%"></div>
                                </div>
                                <span class="badge ${badgeClass}">${item.utilization}%</span>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

// --- 5. API District Stats (New) ---
function fetchDistrictStats() {
    fetch(DATA_PATH + 'api_districts.json')
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('districtChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Số vụ việc',
                        data: data.values,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        });
}

// --- 6. API Response Time (New) ---
function fetchResponseTime() {
    fetch(DATA_PATH + 'api_response_time.json')
        .then(res => res.json())
        .then(data => {
            // Hiển thị con số trung bình
            document.getElementById('avg-response-val').textContent = data.average;

            const ctx = document.getElementById('responseTimeChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Phút',
                        data: data.values,
                        borderColor: '#198754', // Màu xanh lá
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            suggestedMax: 40 
                        } 
                    }
                }
            });
        });
}