function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  // Create Tweet objects
  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  tweet_array.forEach((tweet) => {
    console.log(tweet.text);
    console.log(tweet.source);
  });

  // Update total tweet count
  document.getElementById("numberTweets").innerText = tweet_array.length;

  // --- EARLIEST AND LATEST TWEET DATES ---
  // Extract date objects from each Tweet
  const tweetDates = tweet_array.map((t) => new Date(t.time));

  // Sort the dates ascending
  tweetDates.sort((a, b) => a - b);

  // Get earliest and latest
  const earliestDate = tweetDates[0];
  const latestDate = tweetDates[tweetDates.length - 1];

  // Format nicely (e.g., "Monday, January 18, 2021")
  const formatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const earliestFormatted = earliestDate.toLocaleDateString(
    "en-US",
    formatOptions
  );
  const latestFormatted = latestDate.toLocaleDateString("en-US", formatOptions);

  // Update the corresponding spans in the HTML
  document.getElementById("firstDate").innerText = earliestFormatted;
  document.getElementById("lastDate").innerText = latestFormatted;

  // (The rest of the tasks will fill in completedEvents, liveEvents, etc.)

  // --- Categorize tweets ---
  // --- Categorize tweets ---
  const total = tweet_array.length;
  let completedEvents = 0;
  let liveEvents = 0;
  let achievements = 0;
  let miscellaneous = 0;
  let userWritten = 0;

  // Iterate through tweets, call source, and add to the counts
  tweet_array.forEach((tweet) => {
    const s = tweet.source; // remember: getter, not method

    if (s === "completed_event") {
      completedEvents += 1;
    } else if (s === "live_event") {
      liveEvents += 1;
    } else if (s === "achievement") {
      achievements += 1;
    } else if (s === "miscellaneous") {
      miscellaneous += 1;
    }

    const isWritten = tweet.written;

    if (isWritten) {
      userWritten += 1;
    }
  });

  // --- Compute percentages ---
  const completedPct = math.format((completedEvents / total) * 100, {
    notation: "fixed",
    precision: 2,
  });
  const livePct = math.format((liveEvents / total) * 100, {
    notation: "fixed",
    precision: 2,
  });
  const achievementsPct = math.format((achievements / total) * 100, {
    notation: "fixed",
    precision: 2,
  });
  const miscPct = math.format((miscellaneous / total) * 100, {
    notation: "fixed",
    precision: 2,
  });

  const userWrittenTextPct = math.format((userWritten / total) * 100, {
    notation: "fixed",
    precision: 2,
  });

  // --- Update HTML spans ---
  document
    .querySelectorAll(".completedEvents")
    .forEach((el) => (el.innerText = completedEvents));
  document
    .querySelectorAll(".liveEvents")
    .forEach((el) => (el.innerText = liveEvents));
  document
    .querySelectorAll(".achievements")
    .forEach((el) => (el.innerText = achievements));
  document
    .querySelectorAll(".miscellaneous")
    .forEach((el) => (el.innerText = miscellaneous));

  document
    .querySelectorAll(".completedEventsPct")
    .forEach((el) => (el.innerText = `${completedPct}%`));
  document
    .querySelectorAll(".liveEventsPct")
    .forEach((el) => (el.innerText = `${livePct}%`));
  document
    .querySelectorAll(".achievementsPct")
    .forEach((el) => (el.innerText = `${achievementsPct}%`));
  document
    .querySelectorAll(".miscellaneousPct")
    .forEach((el) => (el.innerText = `${miscPct}%`));

  document
    .querySelectorAll(".written")
    .forEach((el) => (el.innerText = userWritten));

  document
    .querySelectorAll(".writtenPct")
    .forEach((el) => (el.innerText = userWrittenTextPct));
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
