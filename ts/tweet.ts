class Tweet {
  text;
  time;
  constructor(tweet_text, tweet_time) {
    this.text = tweet_text;
    this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
  }
  //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
  get source() {
    const textLower = this.text.toLowerCase();

    // Completed Event
    if (
      textLower.startsWith("just completed") ||
      textLower.startsWith("just posted")
    ) {
      return "completed_event";
    }

    // Live Event
    if (
      textLower.startsWith("watch") ||
      textLower.includes("right now") ||
      textLower.includes("currently") ||
      textLower.includes("live")
    ) {
      return "live_event";
    }

    // Achievement
    if (
      textLower.startsWith("achieved") ||
      textLower.includes("personal record")
    ) {
      return "achievement";
    }

    // Miscellaneous (everything else)
    return "miscellaneous";
  }

  //returns a boolean, whether the text includes any content written by the person tweeting.
  get written() {
    // consider anything before a link or full text as written
    const textToCheck = this.text.trim();
    return textToCheck.length > 0;
  }

  get writtenText() {
    // return everything before the first link if it exists
    const linkIndex = this.text.indexOf("https://t.co/");
    if (linkIndex === -1) return this.text.trim();
    return this.text.substring(0, linkIndex).trim();
  }

  get activityType() {
    if (this.source !== "completed_event") {
      return "unknown";
    }

    // Find pattern like "10.66 km run" or "2.31 mi walk"
    const match = this.text.match(
      /(?:\d+(?:\.\d+)?)\s*(?:km|mi)\s+([a-zA-Z]+)/i
    );
    if (match && match[1]) {
      return match[1].toLowerCase();
    }

    return "unknown";
  }

  get distance() {
    if (this.source !== "completed_event") {
      return 0;
    }

    // Match "10.66 km" or "2.31 mi"
    const match = this.text.match(/(\d+(?:\.\d+)?)\s*(km|mi)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === "km") {
        return value / 1.609; // convert to miles
      } else {
        return value;
      }
    }

    return 0;
  }

  getHTMLTableRow(rowNumber) {
    const activity = this.activityType || "N/A";
    const text = this.writtenText || this.text;
    const linkIndex = this.text.indexOf("https://t.co/");
    const link = linkIndex !== -1 ? this.text.substring(linkIndex) : "#";

    return `
    <tr>
      <td>${rowNumber}</td>
      <td>${activity}</td>
      <td><a href="${link}" target="_blank">${text}</a></td>
    </tr>
  `;
  }
}

