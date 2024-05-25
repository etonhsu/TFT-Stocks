import React, {useMemo, useState} from 'react';
import {
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Tooltip, Area, TooltipProps
} from '../../../node_modules/recharts';
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";
import {ChartContainer, ChartStyledButton} from "../../containers/multiUse/ChartContainer.tsx";

interface PortfolioHistoryData {
  date: Date | string;
  value: number;
}

interface UserChartProps {
  portfolioHistory: PortfolioHistoryData[];
}

const formatDate = (date: Date): string => {
  // Ensure date is a Date object
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};

export const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length && typeof payload[0].value === 'number') {
    return (
      <div style={{
          backgroundColor: '#333',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: '16px'
        }}>
        <p>
          <strong>Value: {formatCurrency(payload[0].value, 2)}</strong><br/>
          {formatDate(new Date(label as string))}
        </p>
      </div>
    );
  }

  return null;
};

export const UserChart: React.FC<UserChartProps> = ({ portfolioHistory }) => {
  const [timeRange, setTimeRange] = useState<'3days' | '1week' | 'all'>('all');

  const chartData = useMemo(() => {
    return portfolioHistory.map(item => ({
      date: new Date(item.date),  // Ensure each date is a Date object
      value: item.value
    })).filter(item => {
      const now = new Date();
      const date = new Date(item.date);
      switch (timeRange) {
        case '3days':
          return date >= new Date(now.setDate(now.getDate() - 3));
        case '1week':
          return date >= new Date(now.setDate(now.getDate() - 7));
        default:
          return true;
      }
    });
  }, [portfolioHistory, timeRange]);

    const minY = Math.min(...chartData.map(d => d.value));
    const maxY = Math.max(...chartData.map(d => d.value));
    const padding = 0.2 * (maxY - minY);
    const paddedMinY = minY - padding;
    const paddedMaxY = maxY + padding;
    const paddedRange = paddedMaxY - paddedMinY;
    const step = paddedRange / 2;
    const ticks = [minY - padding + (step/2), minY - padding + step, maxY + padding - (step/2)];

    const lineColor = chartData.length > 1 && chartData[0].value < chartData[chartData.length - 1].value ? '#82ca9d' : '#f44336';

    const formatTicks = (tick: number): string => {
        return (Math.round(tick / 1000) * 1000).toString();
    };

    const tickStyle = {
      fontSize: '14px', // Adjust the font size as needed
      fill: '#777'     // Adjust the font color as needed
    };

  return (
      <ChartContainer label={"Performance"}>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <ChartStyledButton onClick={() => setTimeRange('all')}>All</ChartStyledButton>
              <ChartStyledButton onClick={() => setTimeRange('1week')}>1W</ChartStyledButton>
              <ChartStyledButton onClick={() => setTimeRange('3days')}>3D</ChartStyledButton>
          </div>
          <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                  <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="10%" stopColor={lineColor} stopOpacity={0.5}/>
                          <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
                      </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis
                      dataKey="date" tickFormatter={formatDate}
                      tick={tickStyle}
                  />
                  <YAxis
                      domain={[minY - padding, maxY + padding]}
                      tickFormatter={formatTicks}
                      tick={tickStyle}
                      ticks={ticks}
                  />
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="value" stroke={lineColor} fillOpacity={1} fill="url(#colorValue)"/>
              </AreaChart>
          </ResponsiveContainer>
      </ChartContainer>
  );
};
