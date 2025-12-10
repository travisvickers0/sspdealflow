import { storage } from "./storage";

interface PropertyMeta {
  title: string;
  description: string;
  image: string;
  url: string;
}

export async function getPropertyMetaBySlug(slug: string, baseUrl: string): Promise<PropertyMeta | null> {
  try {
    const property = await storage.getPropertyBySlug(slug);
    if (!property) {
      return null;
    }

    const address = property.address;
    const city = property.city;
    const state = property.state;
    const fullAddress = `${address}, ${city}, ${state}`;
    
    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(property.purchasePrice);

    const equity = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(property.estimatedEquity);

    const title = `${fullAddress} | SSP Deal Flow`;
    const description = `Investment opportunity: ${property.beds} bed, ${property.baths} bath, ${property.squareFeet?.toLocaleString() || 'N/A'} sqft. Purchase: ${price}, Estimated Equity: ${equity}`;
    
    let image = property.mainPhotoUrl || '/og-image.png';
    if (image.startsWith('/')) {
      image = `${baseUrl}${image}`;
    }

    return {
      title,
      description,
      image,
      url: `${baseUrl}/property/${property.slug}`,
    };
  } catch (error) {
    console.error('Error fetching property for SEO:', error);
    return null;
  }
}

export function injectMetaTags(html: string, meta: PropertyMeta): string {
  const replacements: [RegExp, string][] = [
    [/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`],
    [/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`],
    [/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`],
    [/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${escapeHtml(meta.image)}" />`],
    [/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`],
    [/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`],
    [/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`],
  ];

  let result = html;
  
  if (!result.includes('<meta property="og:url"')) {
    result = result.replace(
      /<meta property="og:type"/,
      `<meta property="og:url" content="${escapeHtml(meta.url)}" />\n    <meta property="og:type"`
    );
  }

  if (!result.includes('<meta name="description"')) {
    result = result.replace(
      /<meta property="og:title"/,
      `<meta name="description" content="${escapeHtml(meta.description)}" />\n    <meta property="og:title"`
    );
  }

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function extractPropertySlug(url: string): string | null {
  const match = url.match(/\/property\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}
