document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard loaded.");
    
    const periodSelect = document.getElementsByClassName('dashboard__period-select')[0];
    console.log(periodSelect);
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            fetchSummary(this.value);
        });
        
        fetchSummary(periodSelect.value);
    } else {
        // Fallback if no select element found
        fetchSummary('month');
    }
    console.log(periodSelect);
    fetchTimeline();
    fetchDistributions();
    fetchResources();
    fetchDistrictStats();
    fetchResponseTime();
});

const DATA_PATH = '/static/analytics/data/';
const API_BASE = '/analytics/api/';
// --- 1. API Summary (KPIs) ---
function fetchSummary(period = 'month') {
    fetch(`${API_BASE}summary/?period=${period}`)
        .then(res => res.json())
        .then(data => {
            // Update data
            updateKPI('kpi-total', data.total_requests);
            updateKPI('kpi-pending', data.pending_requests);
            updateKPI('kpi-processing', data.processing_requests);
            updateKPI('kpi-resolved', data.resolved_requests);

            // Update trends
            updateTrend('trend-total', data.trends.total, period);
            updateTrend('trend-pending', data.trends.pending, period);
            updateTrend('trend-processing', data.trends.processing, period);
            updateTrend('trend-resolved', data.trends.resolved, period);
        })
        .catch(err => console.error("Error fetching summary:", err));
}

function updateKPI(id, value) {
    document.getElementById(id).textContent = value.toLocaleString('vi-VN');
}

function updateTrend(elementId, value, period) {
    const el = document.getElementById(elementId);
    const icon = value > 0 ? '↑' : (value < 0 ? '↓' : '→');
    const colorClass = value > 0 ? 'kpi-card__trend--up' : (value < 0 ? 'kpi-card__trend--down' : 'kpi-card__trend--neutral');
    
    let periodText = "kỳ trước";
    if(period === 'day') periodText = "hôm qua";
    if(period === 'month') periodText = "tháng trước";
    if(period === 'year') periodText = "năm ngoái";
    
    // Xóa class cũ và thêm class mới
    el.className = `kpi-card__trend ${colorClass}`;
    el.textContent = `${icon} ${Math.abs(value)}% so với ${periodText}`;
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