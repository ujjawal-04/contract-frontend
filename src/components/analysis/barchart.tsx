// components/charts/RiskOpportunityChart.tsx

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import DonutScoreChart from "./chart";

interface RiskOpportunityChartProps {
  overallScore: number;
}

export default function RiskOpportunityChart({ overallScore = 75 }: RiskOpportunityChartProps) {
  const [loading, setLoading] = useState(true);
  const [animationActive, setAnimationActive] = useState(true);

  const barChartData = [
    { name: "Risk", value: 100 - overallScore, fill: "#7c3aed" },
    { name: "Opportunity", value: overallScore, fill: "#06b6d4" },
  ];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [overallScore]);

  useEffect(() => {
    if (!loading && animationActive) {
      const timer = setTimeout(() => setAnimationActive(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, animationActive]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full h-full">
      {/* Donut Chart */}
      <div className="w-full md:w-1/2 h-48">
        <DonutScoreChart score={overallScore} animationActive={animationActive} />
      </div>

      {/* Bar Chart */}
      <div className="w-full md:w-1/2 h-48 mt-4 md:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barChartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={(value) => [`${value}%`, '']} labelFormatter={() => ''} />
            <Bar
              dataKey="value"
              isAnimationActive={animationActive}
              animationDuration={1000}
              radius={[0, 4, 4, 0]}
            >
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
