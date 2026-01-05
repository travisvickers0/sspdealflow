/**
 * Facebook Pixel Conversions API Service
 * Sends server-side events to Facebook's Conversions API
 */

const PIXEL_ID = '167356294022738';
const API_VERSION = 'v18.0';
const CONVERSIONS_API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

export interface FacebookPixelEvent {
  eventName: string;
  eventTime: number; // Unix timestamp in seconds
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    externalId?: string; // Hashed user ID
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentCategory?: string;
    contentIds?: string[];
    contents?: Array<{
      id: string;
      quantity?: number;
      itemPrice?: number;
    }>;
    numItems?: number;
    orderId?: string;
    searchString?: string;
  };
  eventId?: string; // Unique event ID to prevent duplicates
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

export interface SendEventOptions {
  events: FacebookPixelEvent[];
  testEventCode?: string; // For testing: TEST21041
  accessToken?: string; // Facebook access token (from env or passed in)
}

/**
 * Send events to Facebook Conversions API
 */
export async function sendFacebookPixelEvent(options: SendEventOptions): Promise<{ events_received: number }> {
  const accessToken = options.accessToken || process.env.FACEBOOK_PIXEL_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('Facebook Pixel Access Token is required. Set FACEBOOK_PIXEL_ACCESS_TOKEN environment variable.');
  }

  const payload: any = {
    data: options.events.map(event => ({
      event_name: event.eventName,
      event_time: event.eventTime,
      event_source_url: event.eventSourceUrl,
      event_id: event.eventId,
      action_source: event.actionSource || 'website',
      user_data: event.userData ? {
        em: event.userData.email ? hashData(event.userData.email) : undefined,
        ph: event.userData.phone ? hashData(event.userData.phone) : undefined,
        fn: event.userData.firstName ? hashData(event.userData.firstName) : undefined,
        ln: event.userData.lastName ? hashData(event.userData.lastName) : undefined,
        ct: event.userData.city ? hashData(event.userData.city) : undefined,
        st: event.userData.state ? hashData(event.userData.state) : undefined,
        zp: event.userData.zipCode ? hashData(event.userData.zipCode) : undefined,
        country: event.userData.country ? hashData(event.userData.country) : undefined,
        external_id: event.userData.externalId ? hashData(event.userData.externalId) : undefined,
      } : undefined,
      custom_data: event.customData ? {
        currency: event.customData.currency || 'USD',
        value: event.customData.value,
        content_name: event.customData.contentName,
        content_category: event.customData.contentCategory,
        content_ids: event.customData.contentIds,
        contents: event.customData.contents,
        num_items: event.customData.numItems,
        order_id: event.customData.orderId,
        search_string: event.customData.searchString,
      } : undefined,
    })),
    access_token: accessToken,
  };

  // Add test event code if provided (for testing)
  if (options.testEventCode) {
    payload.test_event_code = options.testEventCode;
  }

  try {
    const response = await fetch(CONVERSIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Facebook Conversions API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending Facebook Pixel event:', error);
    throw error;
  }
}

/**
 * Hash data using SHA-256 (required by Facebook for PII)
 */
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Helper to create a PageView event
 */
export function createPageViewEvent(url: string, userData?: FacebookPixelEvent['userData']): FacebookPixelEvent {
  return {
    eventName: 'PageView',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: url,
    userData,
    actionSource: 'website',
  };
}

/**
 * Helper to create a Lead event
 */
export function createLeadEvent(url: string, value?: number, userData?: FacebookPixelEvent['userData']): FacebookPixelEvent {
  return {
    eventName: 'Lead',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: url,
    userData,
    customData: {
      currency: 'USD',
      value,
    },
    actionSource: 'website',
  };
}

/**
 * Helper to create a ViewContent event
 */
export function createViewContentEvent(
  url: string,
  contentName: string,
  value?: number,
  userData?: FacebookPixelEvent['userData']
): FacebookPixelEvent {
  return {
    eventName: 'ViewContent',
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: url,
    userData,
    customData: {
      currency: 'USD',
      value,
      contentName,
    },
    actionSource: 'website',
  };
}

