import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Chart = ({ 
  type = 'bar', 
  data = [], 
  xKey = 'name', 
  yKeys = [], 
  colors = ['#4F7CFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  height = 300 
}) => {
  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  const chartTheme = {
    axisLine: { stroke: 'rgba(255,255,255,0.1)' },
    tick: { fill: '#9CA3AF', fontSize: 12 },
    gridLine: { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' },
    tooltipStyle: {
      backgroundColor: '#161B22',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      color: '#fff'
    }
  };

  const renderTooltip = () => (
    <Tooltip 
      contentStyle={chartTheme.tooltipStyle} 
      itemStyle={{ color: '#fff' }}
    />
  );

  const renderChart = () => {
    if (type === 'bar' || type === 'stackedBar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid {...chartTheme.gridLine} vertical={false} />
          <XAxis dataKey={xKey} axisLine={chartTheme.axisLine} tickLine={false} tick={chartTheme.tick} />
          <YAxis axisLine={chartTheme.axisLine} tickLine={false} tick={chartTheme.tick} />
          {renderTooltip()}
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {yKeys.map((key, i) => (
            <Bar 
              key={key} 
              dataKey={key} 
              stackId={type === 'stackedBar' ? 'a' : undefined} 
              fill={colors[i % colors.length]} 
              radius={type === 'bar' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      );
    }

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid {...chartTheme.gridLine} vertical={false} />
          <XAxis dataKey={xKey} axisLine={chartTheme.axisLine} tickLine={false} tick={chartTheme.tick} />
          <YAxis axisLine={chartTheme.axisLine} tickLine={false} tick={chartTheme.tick} />
          {renderTooltip()}
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {yKeys.map((key, i) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={colors[i % colors.length]} 
              strokeWidth={3}
              dot={{ fill: '#161B22', strokeWidth: 2, r: 4, stroke: colors[i % colors.length] }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      );
    }

    if (type === 'pie') {
      return (
        <PieChart>
          {renderTooltip()}
          <Legend />
          <Pie
            data={data}
            dataKey={yKeys[0] || 'value'}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.05)" />
            ))}
          </Pie>
        </PieChart>
      );
    }
    
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export { Chart };

export default Chart;
