export async function postSlackMessage(message) {
  const channelId = process.env.SLACK_CHANNEL_ID
  const token = process.env.SLACK_BOT_OAUTH_TOKEN
 
  if (!token) {
    throw new Error('Missing SLACK_BOT_OAUTH_TOKEN in environment variables')
  }
 
  if (!channelId) {
    throw new Error('Missing SLACK_CHANNEL_ID in environment variables')
  }
 
  const url = 'https://slack.com/api/chat.postMessage'
 
  // Send the main message
  const mainResponse = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channelId,
      text: message,
    }),
  })
 
  const mainData = (await mainResponse.json())
 
  if (!mainData.ok) {
    throw new Error(`Slack API error when posting main message: ${mainData.error}`)
  }
 
  console.log(`✅ Main message sent to Slack channel ${channelId}`)
}
