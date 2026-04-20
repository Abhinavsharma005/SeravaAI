## How Summaries are Calculated
The summary system follows a **Cumulative Delegation** model:

1.  **Context Collection**: Every time a user sends a message, our backend fetches the existing `summaryMap` (previous days' summaries) and the latest chat exchange.
2.  **External AI Processing**: This data is sent to the specialized `/daily-summary` endpoint. The AI uses the `old_summary` context to understand the user's history and creates an updated, semantically linked summary for the current day.
3.  **Timestamping**: New additions within the backend are prefixed with the local HH:mm timestamp before inclusion in the cumulative map.
4.  **Mathematical Aggregation**: `avgStress` is calculated as a **running average** across all recorded analysis events, ensuring that the final score reflects the user's total wellbeing trajectory rather than just a single moment.

## Database Storage (User Model)
We store the following enriched metrics in the `User` document:

-   `summaryMap` (Map): Key-Value pairs of `{ "YYYY-MM-DD": "Summary text..." }`. This builds up indefinitely.
-   `dominantEmotion` (String): The primary emotion detected across recent interactions (e.g., "Anxious", "Neutral").
-   `avgStress` (Number): A 0-100 float representing the average stress risk detected life-to-date.
-   `riskTrend` (String): The direction of the user's mental health risk (e.g., "Increasing", "Decreasing").
-   `totalAnalysisCount` (Number): Used for calculating the weighted average stress score.

## How to Fetch the Data

### 1. From the Backend (Node.js/Next.js)
If you are working in an API route, fetch the user by their UID:

```javascript
import User from "@/models/User";

const user = await User.findOne({ uid: "user_uid_here" });
const summaryMap = user.summaryMap; // This is a Map
const latestDate = Object.keys(Object.fromEntries(summaryMap)).sort().reverse()[0];
const latestSummary = summaryMap.get(latestDate);
```

## Background Summary Generation (12:00 AM)
We use **Vercel Cron** to ensure summaries are ready every morning:

- **Schedule**: Every day at 00:00 AM UTC.
- **Endpoint**: `/api/cron/daily-summary` (defined in `vercel.json`).
- **Security**: The endpoint is protected by a `CRON_SECRET`.

### Action Required: Set up CRON_SECRET
To enable this, you **must** add the following environment variable in the Vercel Dashboard (**Settings > Environment Variables**):

- **Key**: `CRON_SECRET`
- **Value**: `aegis_ai_v1_cron_889922_xyz` (or any random secure string of your choice).

### How it works
Vercel automatically hits the `/api/cron/daily-summary` URL at midnight. The code checks the `Authorization` header against your `CRON_SECRET`. If they match, it triggers the summary generation for all active users.

## Emergency Button "Live Sync"
To ensure the emergency SMS is always up to date with the very latest information, the system performs a **Live Sync**:

1.  **Trigger**: When the user clicks "Inform Contacts" in the Emergency modal.
2.  **Action**: The frontend forces a call to `/api/chat/analysis` with `triggerSummary: true`.
3.  **Result**: The AI service takes all of today's messages and creates a fresh summary *immediately* before the SMS is generated. 

### Manual Trigger (Internal)
Routine chat messages still log stress levels and individual analysis to the database for monitoring but **do not** trigger the expensive cumulative AI summary. This saves significant token costs without losing metadata.

## Formatting for SMS
When sending an emergency SMS, you can format the data like this:

```javascript
const message = `
🚨 AEGIS AI EMERGENCY ALERT
User: ${user.name}
Latest Summary (${latestDate}): ${latestSummary}
Overall Mood: ${user.dominantEmotion}
Stress Level: ${user.avgStress.toFixed(0)}%
Trend: ${user.riskTrend}
`.trim();
```

## AI Service Synchronization
The summary is automatically synchronized with the AI service at:
`POST https://stress-ai-service-n783.onrender.com/daily-summary`

Your teammate (the one handling this part) has ensured that this endpoint returns the updated `summary` map, which our backend then persists.

---
**Note**: If you need to trigger a manual summary refresh, you can call the `/api/chat/analysis` endpoint with the latest message logs.
