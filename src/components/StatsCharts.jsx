import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatsCharts({ dailyChart }) {
  if (!dailyChart || dailyChart.length === 0) return null;

  const labels = dailyChart.map(d => d.display_date);
  const dataPoints = dailyChart.map(d => Number(d.total_distance).toFixed(1));

  const chartData = {
    labels,
    datasets: [
      {
        label: '當日朋友圈合力跑量 (KM)',
        data: dataPoints,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        hoverBackgroundColor: '#00F59B',
        borderColor: '#10B981',
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#94A3B8',
        bodyColor: '#10B981',
        bodyFont: {
          weight: 'bold',
          size: 14
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` 合力跑量: ${context.parsed.y} 公里`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#94A3B8',
          font: {
            family: 'Outfit',
            weight: 600
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
          drawBorder: false
        },
        ticks: {
          color: '#64748B',
          callback: (value) => `${value}k`
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} color="#10B981" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>近 7 日團隊跑量走勢</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} color="#10B981" /> 每天都有人接棒開跑
        </span>
      </div>

      <div style={{ height: '200px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
