import Plot from "react-plotly.js";
import type { AnswerStatistic } from "../../api-types";

interface Props {
  title: string;
  statistics: AnswerStatistic[];
}

export function StatisticsChart({ title, statistics }: Props) {
  if (statistics.length === 0) {
    return <p>No data available for this category.</p>;
  }

  const data = [
    {
      type: "bar" as const,
      x: statistics.map((s) => s.answerValue),
      y: statistics.map((s) => s.count),
      text: statistics.map((s) => `${s.percentage.toFixed(1)}%`),
      textposition: "auto" as const,
      marker: {
        color: "rgb(55, 83, 109)",
      },
    },
  ];

  const layout = {
    title,
    xaxis: { title: "Answer" },
    yaxis: { title: "Count" },
    margin: { t: 40, b: 80, l: 60, r: 20 },
    autosize: true,
  };

  return (
    <div className="statistics-chart">
      <Plot
        data={data}
        layout={layout}
        useResizeHandler
        style={{ width: "100%", height: "400px" }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}
