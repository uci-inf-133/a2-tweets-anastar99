let writtenTweets = []; // will hold Tweet objects

// Parse the saved tweets
function parseTweets(runkeeper_tweets) {
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  // Filter to just written tweets (exclude automated messages if needed)
  writtenTweets = runkeeper_tweets
    .filter((tweet) => tweet.text && tweet.text.trim() !== "")
    .map((tweet) => new Tweet(tweet.text, tweet.created_at));

  // Initially populate table with all tweets
  updateTweetTable("");
}

// Updates the table based on a search string
function updateTweetTable(searchString) {
  const tbody = document.getElementById("tweetTable");

  // Filter tweets by search string (case-insensitive)
  const filtered = writtenTweets.filter((tweet) =>
    tweet.writtenText.toLowerCase().includes(searchString.toLowerCase())
  );

  // Update count and text spans
  document.getElementById("searchCount").innerText = filtered.length;
  document.getElementById("searchText").innerText = searchString;

  // Populate table rows using getHTMLTableRow
  tbody.innerHTML = filtered
    .map((tweet, index) => tweet.getHTMLTableRow(index + 1))
    .join("");
}

// Add event listener for live search
function addEventHandlerForSearch() {
  const input = document.getElementById("textFilter");
  input.addEventListener("input", (event) => {
    const searchString = event.target.value;
    updateTweetTable(searchString);
  });
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
