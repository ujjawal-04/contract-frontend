import { useEffect, useState } from "react";
import { Label, Pie, PieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface OverallScoreChartProps {
  overallScore: number;
}

export default function OverallScoreChart({ overallScore = 75 }: OverallScoreChartProps) {
  const [loading, setLoading] = useState(true);
  const [animationActive, setAnimationActive] = useState(true);
  
  // Define data without fill property
  const pieChartData = [
    {
      name: "Risks",
      value: 100 - overallScore,
    },
    {
      name: "Opportunities",
      value: overallScore,
    },
  ];
  
  // Define colors separately - using a format Recharts definitely supports
  // These are approximate equivalents of your theme colors
  const COLORS = ["#7c3aed", "#06b6d4"]; // Purple and Teal
  
  // Bar chart data
  const barChartData = [
    { name: "Risk", value: 100 - overallScore, fill: "#7c3aed" },
    { name: "Opportunity", value: overallScore, fill: "#06b6d4" }
  ];
  
  const chartConfig = {
    value: {
      label: "value",
    },
    Risks: {
      label: "Risks",
      color: "#7c3aed", // Purple
    },
    Opportunities: {
      label: "Opportunities",
      color: "#06b6d4", // Teal
    }
  } satisfies ChartConfig;
  
  // Effect for loading animation
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [overallScore]); // Re-trigger loading when score changes

  // Disable animation after initial render
  useEffect(() => {
    if (!loading && animationActive) {
      const timer = setTimeout(() => {
        setAnimationActive(false);
      }, 1000);
      
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
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor content={<ChartTooltipContent />} />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              paddingAngle={5}
              isAnimationActive={animationActive}
              animationDuration={1000}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  if(viewBox && "cx" in viewBox && "cy" in viewBox ) {
                    const { cx, cy } = viewBox;
                    return (
                      <g>
                        <text 
                          x={cx} 
                          y={cy - 5} 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          className="text-2xl font-bold fill-gray-800"
                        >
                          {overallScore}%
                        </text>
                        <text 
                          x={cx} 
                          y={cy + 15} 
                          textAnchor="middle" 
                          dominantBaseline="central"
                          className="text-xs fill-gray-500"
                        >
                          Score
                        </text>
                      </g>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      
      {/* Bar Chart */}
      <div className="w-full md:w-1/2 h-48 mt-4 md:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barChartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip 
              formatter={(value) => [`${value}%`, '']}
              labelFormatter={() => ''}
            />
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