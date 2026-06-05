export interface Monument {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export interface Governorate {
  id: string;
  name: string;
  nameAr: string;
  regionId: string;
  lat: number;
  lng: number;
  culture: string;
  traditions: string;
  cuisine: string;
  monuments: Monument[];
}

export interface Region {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  governorates: string[];
  centerLat: number;
  centerLng: number;
}

export const regions: Region[] = [
  {
    id: "grand-tunis",
    name: "Grand Tunis",
    nameAr: "تونس الكبرى",
    description: "The capital region, blending Mediterranean modernity with deep historical roots dating back to Carthage.",
    governorates: ["tunis", "ariana", "ben-arous", "manouba"],
    centerLat: 36.8065,
    centerLng: 10.1815,
  },
  {
    id: "nord-est",
    name: "Nord-Est",
    nameAr: "الشمال الشرقي",
    description: "Coastal region known for pristine beaches, citrus groves, and the artistic legacy of the Cap Bon peninsula.",
    governorates: ["bizerte", "nabeul", "zaghouan"],
    centerLat: 36.9,
    centerLng: 10.3,
  },
  {
    id: "nord-ouest",
    name: "Nord-Ouest",
    nameAr: "الشمال الغربي",
    description: "Mountainous region with Roman ruins, oak forests, and traditional Berber villages.",
    governorates: ["beja", "jendouba", "le-kef", "siliana"],
    centerLat: 36.5,
    centerLng: 8.8,
  },
  {
    id: "centre-est",
    name: "Centre-Est",
    nameAr: "الوسط الشرقي",
    description: "The Sahel — Tunisia's olive-growing heartland with golden beaches and historic port cities.",
    governorates: ["sousse", "monastir", "mahdia", "sfax"],
    centerLat: 35.4,
    centerLng: 10.5,
  },
  {
    id: "centre-ouest",
    name: "Centre-Ouest",
    nameAr: "الوسط الغربي",
    description: "Spiritual heart of Tunisia, home to the Great Mosque of Kairouan and sweeping steppes.",
    governorates: ["kairouan", "kasserine", "sidi-bouzid"],
    centerLat: 35.3,
    centerLng: 9.1,
  },
  {
    id: "sud",
    name: "Sud",
    nameAr: "الجنوب",
    description: "Gateway to the Sahara — desert oases, troglodyte dwellings, and Star Wars filming locations.",
    governorates: ["gabes", "medenine", "tataouine", "gafsa", "tozeur", "kebili"],
    centerLat: 33.5,
    centerLng: 9.5,
  },
];
