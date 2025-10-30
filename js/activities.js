function renderActivityCount(data) {
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Number of Tweets per activity type",
    data: { values: data },
    mark: "bar",
    encoding: {
      x: { field: "activityType", type: "nominal", sort: "-y" },
      y: { aggregate: "count", type: "quantitative" },
      color: { field: "activityType", type: "nominal", legend: null },
    },
  };
  return vegaEmbed("#activityVis", spec, { actions: false });
}

function renderDistanceByDay(data) {
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Distance by day of week",
    data: { values: data },
    mark: "point",
    encoding: {
      x: { field: "dayOfWeek", type: "ordinal" },
      y: { field: "distance", type: "quantitative" },
      color: { field: "activityType", type: "nominal" },
    },
  };
  return vegaEmbed("#distanceVis", spec, { actions: false });
}

function renderDistanceByDayAggregated(data) {
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Mean distance by day of week",
    data: { values: data },
    mark: "bar",
    encoding: {
      x: { field: "dayOfWeek", type: "ordinal" },
      y: { aggregate: "mean", field: "distance", type: "quantitative" },
      color: { field: "activityType", type: "nominal" },
    },
  };
  return vegaEmbed("#distanceVisAggregated", spec, { actions: false });
}

function parseTweets(runkeeper_tweets) {
  // Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  // Create Tweet objects
  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  // --- 🟢 Filter completed tweets (only those with distance/activity)
  const completedTweets = tweet_array.filter(
    (t) => t.source === "completed_event" && t.activityType && t.distance
  );

  // --- 🟢 Prepare Vega-Lite data
  const activityData = completedTweets.map((t) => ({
    activityType: t.activityType,
    distance: t.distance,
    dayOfWeek: new Date(t.time).toLocaleString("en-US", { weekday: "short" }),
  }));

  // Count activity types
  const activityCounts = {};
  completedTweets.forEach((t) => {
    const type = t.activityType;
    activityCounts[type] = (activityCounts[type] || 0) + 1;
  });

  // Sort by count descending
  const sortedActivities = Object.entries(activityCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Update spans
  document.getElementById("numberActivities").innerText =
    completedTweets.length;
  document.getElementById("firstMost").innerText =
    sortedActivities[0]?.[0] || "N/A";
  document.getElementById("secondMost").innerText =
    sortedActivities[1]?.[0] || "N/A";
  document.getElementById("thirdMost").innerText =
    sortedActivities[2]?.[0] || "N/A";

  // --- Group distances by activity type
  const activityDistances = {};
  completedTweets.forEach((t) => {
    const type = t.activityType;
    if (!activityDistances[type]) activityDistances[type] = [];
    activityDistances[type].push(t.distance);
  });

  // --- Compute average distances per activity type
  const activityAverages = {};
  for (const [type, distances] of Object.entries(activityDistances)) {
    const sum = distances.reduce((a, b) => a + b, 0);
    activityAverages[type] = sum / distances.length;
  }

  // --- Find longest and shortest average distance activities
  const sortedByDistance = Object.entries(activityAverages).sort(
    (a, b) => b[1] - a[1]
  );
  const longestActivityType = sortedByDistance[0][0];
  const shortestActivityType = sortedByDistance[sortedByDistance.length - 1][0];

  // --- Determine if longest activities happen more on weekdays or weekends
  const longestDistances = completedTweets.filter(
    (t) => t.activityType === longestActivityType
  );
  let weekdaySum = 0,
    weekdayCount = 0,
    weekendSum = 0,
    weekendCount = 0;

  longestDistances.forEach((t) => {
    const day = new Date(t.time).getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      weekendSum += t.distance;
      weekendCount++;
    } else {
      weekdaySum += t.distance;
      weekdayCount++;
    }
  });

  const weekdayAvg = weekdayCount ? weekdaySum / weekdayCount : 0;
  const weekendAvg = weekendCount ? weekendSum / weekendCount : 0;
  const weekdayOrWeekendLonger =
    weekdayAvg > weekendAvg ? "weekdays" : "weekends";

  // --- Update the HTML spans
  document.getElementById("longestActivityType").innerText =
    longestActivityType;
  document.getElementById("shortestActivityType").innerText =
    shortestActivityType;
  document.getElementById("weekdayOrWeekendLonger").innerText =
    weekdayOrWeekendLonger;

  // --- 🟢 Visualization 1: Count of each activity type
  const activity_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "A graph of the number of Tweets containing each type of activity.",
    data: {
      values: activityData,
    },
    mark: "bar",
    encoding: {
      x: {
        field: "activityType",
        type: "nominal",
        title: "Activity Type",
        sort: "-y",
      },
      y: {
        aggregate: "count",
        type: "quantitative",
        title: "Number of Tweets",
      },
      color: {
        field: "activityType",
        type: "nominal",
        legend: null,
      },
    },
  };

  // Render chart
  vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

  // --- 🟢 Visualization 2 (Optional): Distance by day of week
  // Example — you’ll toggle this later with your “aggregate” button

  let showingAggregated = false;

  const aggregateButton = document.getElementById("aggregate");
  aggregateButton.addEventListener("click", () => {
    if (showingAggregated) {
      // Show all points
      document.getElementById("distanceVis").style.display = "block";
      document.getElementById("distanceVisAggregated").style.display = "none";
      aggregateButton.innerText = "Show means"; // update button text
    } else {
      // Show aggregated means
      document.getElementById("distanceVis").style.display = "none";
      document.getElementById("distanceVisAggregated").style.display = "block";
      aggregateButton.innerText = "Show all distances"; // update button text
    }
    showingAggregated = !showingAggregated;
  });

  // Render all points first
  renderDistanceByDay(activityData);
  document.getElementById("distanceVisAggregated").style.display = "none"; // hide aggregated initially
  renderDistanceByDayAggregated(activityData);

  // You could render this on another div, e.g.
  // vegaEmbed("#distanceVis", distanceByDaySpec, { actions: false });
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  loadSavedRunkeeperTweets().then(parseTweets);
});
