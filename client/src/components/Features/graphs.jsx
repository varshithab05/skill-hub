import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Chart Data
export const areaChartData = [
  { name: "Aug 2024", users: 4000, projects: 2400 },
  { name: "Sep 2024", users: 4500, projects: 2800 },
  { name: "Oct 2024", users: 5200, projects: 3300 },
  { name: "Nov 2024", users: 6000, projects: 4000 },
  { name: "Dec 2024", users: 7000, projects: 5000 },
  { name: "Jan 2025", users: 8000, projects: 6000 },
  { name: "Feb 2025", users: 12000, projects: 9000 },
  { name: "Mar 2025", users: 18000, projects: 14000 },
];

export const skillsData = [
  { name: "Development", value: 35 },
  { name: "Design", value: 25 },
  { name: "Writing", value: 20 },
  { name: "Marketing", value: 15 },
  { name: "Others", value: 5 },
];

export const revenueData = [
  { month: "Aug 2024", freelancer: 26000, enterprise: 41000 },
  { month: "Sep 2024", freelancer: 31000, enterprise: 45000 },
  { month: "Oct 2024", freelancer: 36000, enterprise: 50000 },
  { month: "Nov 2024", freelancer: 41000, enterprise: 56000 },
  { month: "Dec 2024", freelancer: 46000, enterprise: 61000 },
  { month: "Jan 2025", freelancer: 51000, enterprise: 67000 },
  { month: "Feb 2025", freelancer: 75000, enterprise: 91000 },
  { month: "Mar 2025", freelancer: 91000, enterprise: 110000 },
];

export const engagementData = [
  { month: "Aug 2024", engagement: 55, retention: 45 },
  { month: "Sep 2024", engagement: 58, retention: 48 },
  { month: "Oct 2024", engagement: 62, retention: 52 },
  { month: "Nov 2024", engagement: 67, retention: 57 },
  { month: "Dec 2024", engagement: 73, retention: 63 },
  { month: "Jan 2025", engagement: 77, retention: 67 },
  { month: "Feb 2025", engagement: 92, retention: 82 },
  { month: "Mar 2025", engagement: 95, retention: 85 },
];

export const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Chart Components
export const GrowthChart = () => (
  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={areaChartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="name"
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Months",
            position: "bottom",
            fill: "#718096",
            offset: 10,
          }}
        />
        <YAxis
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Count",
            angle: -90,
            position: "insideLeft",
            fill: "#718096",
            offset: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#E5E7EB" }}
          itemStyle={{ color: "#E5E7EB" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingTop: "10px",
            color: "#E5E7EB",
          }}
        />
        <Area
          name="Active Users"
          type="monotone"
          dataKey="users"
          stroke="#0088FE"
          fillOpacity={1}
          fill="url(#colorUsers)"
        />
        <Area
          name="Completed Projects"
          type="monotone"
          dataKey="projects"
          stroke="#00C49F"
          fillOpacity={1}
          fill="url(#colorProjects)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SkillsDistributionChart = () => (
  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={skillsData}
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            percent,
            name,
          }) => {
            const radius = outerRadius + 20;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text
                x={x}
                y={y}
                fill="#E5E7EB"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize="12"
              >
                {`${name} (${(percent * 100).toFixed(0)}%)`}
              </text>
            );
          }}
        >
          {skillsData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#E5E7EB" }}
          itemStyle={{ color: "#E5E7EB" }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{
            color: "#E5E7EB",
            paddingLeft: "20px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const RevenueChart = () => (
  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={revenueData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="month"
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Months",
            position: "bottom",
            fill: "#718096",
            offset: 10,
          }}
        />
        <YAxis
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Revenue ($)",
            angle: -90,
            position: "insideLeft",
            fill: "#718096",
            offset: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#E5E7EB" }}
          itemStyle={{ color: "#E5E7EB" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingTop: "10px",
            color: "#E5E7EB",
          }}
        />
        <Bar
          name="Freelancer Revenue"
          dataKey="freelancer"
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="Enterprise Revenue"
          dataKey="enterprise"
          fill="#82ca9d"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const EngagementChart = () => (
  <div className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={engagementData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="month"
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Months",
            position: "bottom",
            fill: "#718096",
            offset: 10,
          }}
        />
        <YAxis
          stroke="#718096"
          tick={{ fill: "#718096" }}
          label={{
            value: "Percentage (%)",
            angle: -90,
            position: "insideLeft",
            fill: "#718096",
            offset: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#E5E7EB" }}
          itemStyle={{ color: "#E5E7EB" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingTop: "10px",
            color: "#E5E7EB",
          }}
        />
        <Line
          type="monotone"
          name="User Engagement"
          dataKey="engagement"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4, fill: "#8884d8" }}
        />
        <Line
          type="monotone"
          name="User Retention"
          dataKey="retention"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 4, fill: "#82ca9d" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
