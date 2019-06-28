# google sheets / slack json webhook receiver

Google Apps Script that appends a JSON object to a Google Sheets spreadsheet as columns, suitable for use as a [formsort](https://formsort.com) webhook integration.

Also allows setting a Slack webhook to be pinged when receiving a result.

## features

- runs entirely within your Google Apps domain
- automatically creates new columns if new data fields appear in the JSON body
- always adds a `received_at` column to mark when data was received by the script 

## setup

0. Make a new Google Sheet you want to use for your answers. Keep it blank.
1. Go to https://script.google.com and create a new script.
2. Paste the `Code.gs` in this respository into the `Code.gs` of that project
3. Update the `SPREADSHEET_URL` variable at the top with the URL of your spreadsheet. If you'd like a slack webhook to be pinged when the webhook is processed, enabled the [Incoming Webhooks App](https://api.slack.com/incoming-webhooks) on slack and then replace SLACK_URL with the webhook URL.
4. Debug the script, to ensure it's connected, by going to `Run > Debug Function > test`. You should see a row added to the output.
5. Publish the script, using `Publish > Deploy as web app`, with the following settings:
      - Execute the app as: **Me**
      - Who has access to the app: **Anyone, even anonymous** (Don't worry, the URL is unique and only you will have it.)
6. Copy the current web app url to Formsort's webhook url in the integrations section.
7. To test the configuration end-to-end, use the *Send test webhook* button.
