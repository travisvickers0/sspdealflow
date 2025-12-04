import heroImg from "@assets/generated_images/modern_luxury_home_exterior_at_twilight.png";
import prop1Img from "@assets/generated_images/modern_white_farmhouse_exterior.png";
import prop2Img from "@assets/generated_images/bright_scandinavian_living_room.png";
import prop3Img from "@assets/generated_images/renovated_historic_townhouse.png";

// Repeat images for gallery (since we only have 4 unique images, reuse them for multiple photos)
const galleryImages = [heroImg, prop1Img, prop2Img, prop3Img];

export type PropertyStatus = "needs_funding" | "committed" | "funded" | "archived";

export interface Comp {
  id: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  soldDate: string;
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  purchase_price: number;
  arv: number;
  rehab_budget: number;
  equity_available: number;
  description: string;
  images: string[];
  status: PropertyStatus;
  created_at: string;
  closing_date: string;
  beds: number;
  baths: number;
  sqft: number;
  comps: Comp[];
}

export const properties: Property[] = [
  {
    id: "1",
    slug: "123-maple-ave-austin",
    address: "123 Maple Ave",
    city: "Austin",
    state: "TX",
    zip: "78702",
    lat: 30.2672,
    lng: -97.7431,
    purchase_price: 450000,
    arv: 750000,
    rehab_budget: 120000,
    equity_available: 200000,
    beds: 4,
    baths: 3,
    sqft: 3200,
    description: "A beautiful mid-century modern renovation opportunity in the heart of East Austin. Large lot with potential for ADU.",
    images: [prop1Img, prop2Img, prop3Img, heroImg],
    status: "needs_funding",
    created_at: "2023-10-01T10:00:00Z",
    closing_date: "2024-12-18",
    comps: [
      {
        id: "comp1-1",
        address: "98 Maple Ave",
        price: 485000,
        beds: 4,
        baths: 3,
        sqft: 3100,
        soldDate: "2024-08-15",
        lat: 30.2670,
        lng: -97.7425,
      },
      {
        id: "comp1-2",
        address: "156 Oak Ridge",
        price: 520000,
        beds: 4,
        baths: 2.5,
        sqft: 3300,
        soldDate: "2024-09-22",
        lat: 30.2680,
        lng: -97.7440,
      },
      {
        id: "comp1-3",
        address: "45 Elm Street",
        price: 495000,
        beds: 4,
        baths: 3,
        sqft: 3250,
        soldDate: "2024-07-10",
        lat: 30.2665,
        lng: -97.7435,
      },
    ],
  },
  {
    id: "2",
    slug: "456-oak-st-nashville",
    address: "456 Oak St",
    city: "Nashville",
    state: "TN",
    zip: "37203",
    lat: 36.1627,
    lng: -86.7816,
    purchase_price: 320000,
    arv: 550000,
    rehab_budget: 80000,
    equity_available: 150000,
    beds: 3,
    baths: 2,
    sqft: 2100,
    description: "Historic charm meets modern convenience. This property requires a light cosmetic rehab and foundation leveling.",
    images: [prop3Img, heroImg, prop1Img],
    status: "committed",
    created_at: "2023-10-05T14:30:00Z",
    closing_date: "2024-12-20",
    comps: [
      {
        id: "comp2-1",
        address: "512 Oak St",
        price: 335000,
        beds: 3,
        baths: 2,
        sqft: 2050,
        soldDate: "2024-09-05",
        lat: 36.1630,
        lng: -86.7810,
      },
      {
        id: "comp2-2",
        address: "620 Maple Ave",
        price: 355000,
        beds: 3,
        baths: 2.5,
        sqft: 2200,
        soldDate: "2024-08-20",
        lat: 36.1620,
        lng: -86.7825,
      },
      {
        id: "comp2-3",
        address: "378 Birch Ln",
        price: 328000,
        beds: 3,
        baths: 2,
        sqft: 2100,
        soldDate: "2024-07-30",
        lat: 36.1635,
        lng: -86.7820,
      },
    ],
  },
  {
    id: "3",
    slug: "789-pine-ln-denver",
    address: "789 Pine Ln",
    city: "Denver",
    state: "CO",
    zip: "80205",
    lat: 39.7392,
    lng: -104.9903,
    purchase_price: 550000,
    arv: 900000,
    rehab_budget: 150000,
    equity_available: 0,
    beds: 5,
    baths: 3.5,
    sqft: 4000,
    description: "Full gut renovation project in the hot RiNo district. Zoned for mixed use.",
    images: [heroImg, prop1Img, prop2Img],
    status: "funded",
    created_at: "2023-09-15T09:15:00Z",
    closing_date: "2024-12-25",
    comps: [
      {
        id: "comp3-1",
        address: "812 Pine Ln",
        price: 575000,
        beds: 5,
        baths: 3,
        sqft: 3900,
        soldDate: "2024-09-12",
        lat: 39.7395,
        lng: -104.9900,
      },
      {
        id: "comp3-2",
        address: "950 Spruce St",
        price: 595000,
        beds: 5,
        baths: 3.5,
        sqft: 4100,
        soldDate: "2024-08-05",
        lat: 39.7385,
        lng: -104.9910,
      },
      {
        id: "comp3-3",
        address: "625 Cedar Dr",
        price: 560000,
        beds: 4,
        baths: 3,
        sqft: 3800,
        soldDate: "2024-10-01",
        lat: 39.7400,
        lng: -104.9895,
      },
    ],
  },
];

export interface Commitment {
  id: string;
  user_id: string;
  property_id: string;
  amount: number;
  equity_percent: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const commitments: Commitment[] = [
  {
    id: "c1",
    user_id: "u1",
    property_id: "1",
    amount: 50000,
    equity_percent: 25,
    status: "approved",
    created_at: "2023-10-02T11:00:00Z",
  },
  {
    id: "c2",
    user_id: "u2",
    property_id: "1",
    amount: 25000,
    equity_percent: 12.5,
    status: "pending",
    created_at: "2023-10-03T16:45:00Z",
  },
];
