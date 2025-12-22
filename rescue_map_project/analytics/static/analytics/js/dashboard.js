document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard loaded.");
    
    const periodSelect = document.getElementsByClassName('dashboard__period-select')[0];
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            const period = this.value;
            fetchSummary(period);
            fetchTimeline(period);
            fetchDistributions(period);
            fetchResolvedTime(period);
        });
        
        fetchSummary(periodSelect.value);
        fetchTimeline(periodSelect.value);
        fetchDistributions(periodSelect.value);
        fetchResolvedTime(periodSelect.value);
    } else {
        // Fallback if no select element found
        fetchSummary('month');
    }
    
    fetchResources();
    fetchDistrictStats();
});

const DATA_PATH = '/static/analytics/data/';
const API_BASE = '/analytics/api/';
// --- API Summary (KPIs) ---
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

            console.log('KPI data:', data);
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

// --- TIMELINE CHARTS  ---
let timelineChartInstance = null;
function fetchTimeline(period) {
    // Call api to get timeline data 
    fetch(`${API_BASE}timeline/?period=${period}`)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => {
            const ctx = document.getElementById('timelineChart').getContext('2d');

            // Destroy old chart instance if exists
            if (timelineChartInstance) {
                timelineChartInstance.destroy();
            }

            // draw new chart
            timelineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: data.label_text,
                        data: data.values,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false, position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            ticks: { precision: 0 } // show integer only
                        }
                    }
                }
            });
            console.log("Timeline data:", data);
        })
        .catch(err => console.error("Lỗi tải timeline:", err));
}

// --- API Distributions (Status & Priority) ---
let statusChartInstance = null;
let priorityChartInstance = null;
function fetchDistributions(period) {
    fetch(`${API_BASE}distribution/?period=${period}`)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => {
            updateStatusChart(data.status);
            updatePriorityChart(data.priority);
            console.log("Status data:", data.status);
            console.log("Priority data:", data.priority);
        })
        .catch(err => console.error("Lỗi tải distributions:", err));
}

function updateStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updatePriorityChart(data) {
    const ctx = document.getElementById('priorityChart').getContext('2d');

    if (priorityChartInstance) {
        priorityChartInstance.destroy();
    }

    priorityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Số lượng',
                data: data.values,
                backgroundColor: data.colors,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // horizontal bar
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

// --- API District Stats ---
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

// --- API Dispatch Time ---
let resolvedChartInstance = null;
function fetchResolvedTime(period) {
    if(!period) period = 'month';

    fetch(`${API_BASE}resolved-time/?period=${period}`)
        .then(res => res.json())
        .then(data => {
            console.log("Resolved time data:", data);
            // Update big number - average
            const avgEl = document.getElementById('avg-response-val');
            if(avgEl) avgEl.textContent = data.average;

            // Draw bar chart
            const ctx = document.getElementById('resolvedTimeChart').getContext('2d');
            
            if (resolvedChartInstance) {
                resolvedChartInstance.destroy();
            }

            resolvedChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Số lượng đã xử lý',
                        data: data.values,
                        backgroundColor: 'rgba(25, 135, 84, 0.7)', // Màu xanh lá (Success)
                        borderColor: 'rgba(25, 135, 84, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }, // Ẩn chú thích vì chỉ có 1 cột
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Đã xử lý: ${context.parsed.y} ca`;
                                }
                            }
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: { display: true, text: 'Số lượng (Ca)' },
                            ticks: { stepSize: 1 } // Chỉ hiện số nguyên
                        } 
                    }
                }
            });
        })
        .catch(err => console.error("Lỗi tải dispatch time:", err));
}

// --- API Resources ---
function fetchResources() {
    // API này thường là realtime snapshot, không cần tham số period
    fetch(`${API_BASE}resources/`)
        .then(res => res.json())
        .then(data => {
            console.log("Resources data:", data);
            const tbody = document.getElementById('resourceTableBody');
            if(!tbody) return;
            
            tbody.innerHTML = ''; // Clear loading state

            // Mapping type
            const typeMap = {
                // "AMBULANCE": "Xe Cứu Thương",
                // "BOAT": "Xuồng/Cano",
                // "HELICOPTER": "Trực Thăng",
                // "TEAM": "Đội Cứu Hộ",
                // "SUPPLY": "Nhu Yếu Phẩm",
                // "OTHER": "Khác"
                "VEHICLE": "🚑 Phương tiện",
                "MEDICINE": "💊 Y tế",
                "FOOD": "🌾 Lương thực",
                "OTHER": "🛠️ Khác"
            };

            data.forEach(item => {
                const typeName = typeMap[item.type] || item.type;
                
                // Tính số lượng đang được triển khai (Total - Available)
                const deployed = item.total - item.available;

                // Render đúng theo cấu trúc HTML mẫu bạn gửi
                const row = `
                    <tr>
                        <td>${typeName}</td>
                        <td>${item.available}</td>
                        <td>${deployed}</td>
                        <td>
                            <span class="progress-bar" style="--progress: ${item.utilization}%"></span> 
                            ${item.utilization}%
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(err => console.error("Lỗi tải resources:", err));
}