import { HistoricOdds } from "../../types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface OddsMovementChartProps {
  oddsMovements: HistoricOdds[];
}

const options = {
  // ... other chart options ...
  plotOptions: {
    series: {
      marker: {
        enabled: true,
        radius: 6, // Adjust the radius to make the marker bigger
        lineWidth: 1,
        lineColor: "#FFFFFF", // Line color of the circle around the dot
      },
    },
  },
  // ... other chart options ...
};

export default function OddsMovementChart({
  oddsMovements,
}: OddsMovementChartProps) {
  // Find the unique options and the min and max timestamps
  const optionsMap: { [key: string]: [number, number][] } = {};
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  oddsMovements.forEach(({ option, update_timestamp, new_odds }) => {
    const timestamp = new Date(update_timestamp).getTime();
    minTimestamp = Math.min(minTimestamp, timestamp);
    maxTimestamp = Math.max(maxTimestamp, timestamp);

    if (!optionsMap[option]) {
      optionsMap[option] = [];
    }
    optionsMap[option].push([timestamp, new_odds]);
  });

  // Convert the optionsMap to a series array and handle options with only one record
  const series = Object.keys(optionsMap).map((option) => {
    let data = optionsMap[option];
    if (data.length === 1) {
      data = [
        [minTimestamp, data[0][1]], // use the same odds value for minTimestamp
        [maxTimestamp, data[0][1]], // use the same odds value for maxTimestamp
      ];
    }
    return {
      name: option,
      data: data.sort((a, b) => a[0] - b[0]), // sort data points by timestamp
    };
  });

  const options = {
    title: {
      text: "Odds Movement",
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: "Odds",
      },
    },
    series: series,
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  );
}
