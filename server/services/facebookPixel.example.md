# Facebook Pixel Server Events - Testing Guide

## Setup

1. **Set Environment Variables:**
   ```bash
   FACEBOOK_PIXEL_ACCESS_TOKEN=your_access_token_here
   FACEBOOK_TEST_EVENT_CODE=TEST21041  # Optional: set default test code
   ```

2. **Get Access Token:**
   - Go to Facebook Events Manager
   - Select your Pixel (ID: 167356294022738)
   - Go to Settings > Conversions API
   - Generate an access token

## Testing with Test Event Code

### Using cURL

```bash
curl -X POST http://localhost:5000/api/facebook-pixel/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "eventName": "PageView",
        "eventTime": 1704067200,
        "eventSourceUrl": "https://sspdealflow.com/property/123",
        "actionSource": "website"
      }
    ],
    "testEventCode": "TEST21041"
  }'
```

### Using JavaScript/Fetch

```javascript
fetch('/api/facebook-pixel/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    events: [
      {
        eventName: 'PageView',
        eventTime: Math.floor(Date.now() / 1000),
        eventSourceUrl: window.location.href,
        actionSource: 'website'
      }
    ],
    testEventCode: 'TEST21041'
  })
})
.then(res => res.json())
.then(data => console.log('Event sent:', data));
```

### Example: Lead Event

```json
{
  "events": [
    {
      "eventName": "Lead",
      "eventTime": 1704067200,
      "eventSourceUrl": "https://sspdealflow.com/property/123",
      "userData": {
        "email": "investor@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "customData": {
        "currency": "USD",
        "value": 165000,
        "contentName": "Property Investment Inquiry"
      },
      "actionSource": "website"
    }
  ],
  "testEventCode": "TEST21041"
}
```

### Example: ViewContent Event (Property View)

```json
{
  "events": [
    {
      "eventName": "ViewContent",
      "eventTime": 1704067200,
      "eventSourceUrl": "https://sspdealflow.com/property/123",
      "customData": {
        "currency": "USD",
        "value": 165000,
        "contentName": "133 Worchester Cir",
        "contentCategory": "Real Estate Investment"
      },
      "actionSource": "website"
    }
  ],
  "testEventCode": "TEST21041"
}
```

## Response

Success response:
```json
{
  "success": true,
  "events_received": 1,
  "test_mode": true
}
```

## Notes

- All PII (email, phone, names, etc.) is automatically hashed using SHA-256
- The `testEventCode` parameter is only needed during testing
- Remove `testEventCode` in production
- Events will appear in Facebook Events Manager under "Test Events" when using test code

