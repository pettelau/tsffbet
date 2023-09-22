import { HistoricOdds } from "../../types";
import Highcharts, { TooltipFormatterContextObject } from "highcharts";
import HighchartsReact from "highcharts-react-official";

import moment from "moment-timezone";

// Norwegian date display
Highcharts.setOptions({
  lang: {
    months: [
      "Januar",
      "Februar",
      "Mars",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
    weekdays: [
      "Søndag",
      "Mandag",
      "Tirsdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lørdag",
    ],
    shortMonths: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
  },
});

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

  const allArraysHaveLengthOne = Object.values(optionsMap).every(
    (array) => array.length === 1
  );

  // Now, allArraysHaveLengthOne will be true if all arrays in optionsMap have length 1, and false otherwise.

  // Convert the optionsMap to a series array and handle options with only one record
  const series = Object.keys(optionsMap).map((option) => {
    let data = optionsMap[option];
    if (data.length === 1) {
      data = [
        [minTimestamp, data[0][1]], // use the same odds value for minTimestamp
        [
          allArraysHaveLengthOne ? new Date().getTime() : maxTimestamp,
          data[0][1],
        ], // use the same odds value for maxTimestamp
      ];
    }

    // check if option are missing a point for the last timestamp
    // Difference must be greater than one minute
    // 60 000 is number of milliseconds in 1 minute.
    const allSmallerThanMaxTimestamp = data.every(
      (odds) => maxTimestamp - odds[0] > 60000
    );

    // add an extra point if the option is missing for the last timestamp
    if (allSmallerThanMaxTimestamp) {
      data.push([maxTimestamp, data[data.length - 1][1]]);
    }

    return {
      name: option,
      data: data.sort((a, b) => a[0] - b[0]), // sort data points by timestamp
    };
  });

  const options = {
    title: {
      text: "📈 Oddsbevegelser 📉",
    },
    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: {
        millisecond: "%H:%M:%S",
        second: "%H:%M:%S",
        minute: "%H:%M",
        hour: "%H:%M",
        day: "%e. %b",
        week: "%e. %b",
        month: "%b '%y",
        year: "%Y",
      },
    },
    yAxis: {
      title: {
        text: "Odds",
      },
    },
    tooltip: {
      formatter: function (this: TooltipFormatterContextObject): string {
        const norwegianTime = moment(this.x)
          .tz("Europe/Oslo")
          .format("dddd, D. MMMM YYYY HH:mm:ss");
        return `${norwegianTime} <br/> <b>${this.series.name}:</b> ${this.y}`;
      },
    },
    series: series,
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
