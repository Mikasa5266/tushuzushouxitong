<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ bookCount }}</div>
          <div class="stat-label">图书总数</div>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ userCount }}</div>
          <div class="stat-label">注册用户</div>
        </div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">📄</div>
        <div class="stat-info">
          <div class="stat-value">{{ rentCount }}</div>
          <div class="stat-label">总借阅单</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ saleCount }}</div>
          <div class="stat-label">总销售单</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 左侧：趋势图 -->
      <div class="chart-card main-chart">
        <div class="card-header">
          <h3>📅 近一周交易趋势</h3>
        </div>
        <div class="chart-body" ref="trendChartRef"></div>
      </div>

      <!-- 右侧：分类占比 -->
      <div class="chart-card sub-chart">
        <div class="card-header">
          <h3>📊 图书分类占比</h3>
        </div>
        <div class="chart-body" ref="pieChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

// 数据统计变量
const bookCount = ref(0);
const userCount = ref(0);
const rentCount = ref(0);
const saleCount = ref(0);

// 图表 DOM 引用
const trendChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

// 获取过去 7 天的日期数组 (用于 x 轴)
const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // 格式化为 MM-DD
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        dates.push(`${month}-${day}`);
    }
    return dates;
};

// 辅助函数：将数据库时间字符串转换为 MM-DD
const formatToMMDD = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
};

// 初始化数据
const initData = async () => {
  try {
    // 并发请求所有基础数据
    const [booksRes, usersRes, rentRes, saleRes] = await Promise.all([
      axios.get('http://localhost:3000/api/books'),
      axios.get('http://localhost:3000/api/customers'),
      axios.get('http://localhost:3000/api/bills/rent'),
      axios.get('http://localhost:3000/api/bills/buy')
    ]);

    // 更新统计卡片数据
    bookCount.value = booksRes.data.length;
    userCount.value = usersRes.data.length;
    rentCount.value = rentRes.data.length;
    saleCount.value = saleRes.data.length;

    // 初始化图表，传入所有数据
    initCharts(booksRes.data, rentRes.data, saleRes.data);
  } catch (error) {
    console.error("加载仪表盘数据失败:", error);
  }
};

const initCharts = (booksData: any[], rentData: any[], saleData: any[]) => {
  // ---------------- 1. 处理折线图数据 ----------------
  const last7Days = getLast7Days(); // X轴：['12-01', '12-02', ...]
  const rentDailyCounts = new Array(7).fill(0);
  const saleDailyCounts = new Array(7).fill(0);

  // 统计租书量
  rentData.forEach(item => {
      // 数据库字段名可能是 '租借日期'
      const dateKey = formatToMMDD(item['租借日期']); 
      const index = last7Days.indexOf(dateKey);
      if (index !== -1) {
          rentDailyCounts[index]++;
      }
  });

  // 统计售书量
  saleData.forEach(item => {
      // 数据库字段名可能是 '销售日期'
      const dateKey = formatToMMDD(item['销售日期']);
      const index = last7Days.indexOf(dateKey);
      if (index !== -1) {
          saleDailyCounts[index]++;
      }
  });

  // ---------------- 2. 渲染折线图 ----------------
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['租书量', '售书量'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: last7Days // 使用真实日期
      },
      yAxis: {
        type: 'value',
        minInterval: 1 // 保证Y轴刻度是整数
      },
      series: [
        {
          name: '租书量',
          type: 'line',
          smooth: true,
          data: rentDailyCounts, // 使用统计数据
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.01)' }
            ])
          }
        },
        {
          name: '售书量',
          type: 'line',
          smooth: true,
          data: saleDailyCounts, // 使用统计数据
          itemStyle: { color: '#10b981' },
          areaStyle: {
             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.01)' }
            ])
          }
        }
      ]
    });
  }

  // ---------------- 3. 处理并渲染饼图 ----------------
  const categoryMap: Record<string, number> = {};
  booksData.forEach(book => {
    // 确保字段名与后端一致，这里假设是 '书籍类型' (如果是联表查询结果)
    // 如果没有 '书籍类型' 字段，可能需要用 '书籍类型代码' 映射
    const type = book['书籍类型'] || book['书籍类型代码'] || '其他';
    categoryMap[type] = (categoryMap[type] || 0) + 1;
  });
  
  const pieData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }));

  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)' // 显示百分比
      },
      legend: {
        bottom: '0%',
        left: 'center'
      },
      series: [
        {
          name: '图书分类',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData
        }
      ]
    });
  }
};

// 监听窗口大小变化，重绘图表
const handleResize = () => {
  trendChart?.resize();
  pieChart?.resize();
};

onMounted(() => {
  initData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 卡片颜色主题 */
.blue .stat-icon { background: #eff6ff; color: #3b82f6; }
.green .stat-icon { background: #f0fdf4; color: #22c55e; }
.orange .stat-icon { background: #fff7ed; color: #f97316; }
.purple .stat-icon { background: #f3e8ff; color: #a855f7; }

/* 图表区域样式 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左侧宽，右侧窄 */
  gap: 20px;
  flex: 1;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.card-header h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 18px;
}

.chart-body {
  flex: 1;
  min-height: 300px;
  width: 100%;
}
</style>