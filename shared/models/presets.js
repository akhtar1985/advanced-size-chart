// All measurements in cm (base unit)

export const PRESETS = [
  {
    label: "👕 T-Shirt (Unisex)",
    chart: {
      name: "T-Shirt Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "For a relaxed fit, size up one size.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Chest", "Length", "Shoulder"],
          rows: [
            ["XS", 86, 66, 40],
            ["S",  91, 69, 42],
            ["M",  97, 71, 44],
            ["L",  102, 74, 46],
            ["XL", 107, 76, 48],
            ["2XL",112, 79, 50],
            ["3XL",117, 81, 52],
          ],
          units: { Chest: "cm", Length: "cm", Shoulder: "cm" },
        },
      ],
    },
  },
  {
    label: "👔 Dress Shirt (Men)",
    chart: {
      name: "Dress Shirt Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure around the fullest part of your chest and your neck.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "Neck", "Chest", "Waist", "Sleeve"],
          rows: [
            ["S",   37, 91,  76,  63],
            ["M",   39, 97,  81,  64],
            ["L",   41, 102, 86,  65],
            ["XL",  43, 107, 91,  66],
            ["2XL", 45, 112, 97,  67],
          ],
          units: { Neck: "cm", Chest: "cm", Waist: "cm", Sleeve: "cm" },
        },
      ],
    },
  },
  {
    label: "👗 Women's Top / Blouse",
    chart: {
      name: "Women's Top Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure around the fullest part of your bust.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Bust", "Waist", "Hips"],
          rows: [
            ["XS", "0-2",  "32-34", "4-6",   81, 61, 86],
            ["S",  "4-6",  "36-38", "8-10",  86, 66, 91],
            ["M",  "8-10", "40-42", "12-14", 91, 71, 97],
            ["L",  "12-14","44-46", "16-18", 97, 76, 102],
            ["XL", "16-18","48-50", "20-22", 102,81, 107],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm" },
        },
      ],
    },
  },
  {
    label: "👖 Men's Pants / Trousers",
    chart: {
      name: "Men's Pants Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Waist measured at natural waistline. Inseam from crotch to ankle.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip", "Inseam"],
          rows: [
            ["S",   "28-30", "44-46", 74,  91, 81],
            ["M",   "32-34", "48-50", 84,  97, 81],
            ["L",   "36-38", "52-54", 94,  104,81],
            ["XL",  "40-42", "56-58", 104, 111,81],
            ["2XL", "44-46", "60-62", 114, 118,81],
          ],
          units: { Waist: "cm", Hip: "cm", Inseam: "cm" },
        },
      ],
    },
  },
  {
    label: "👗 Women's Pants / Jeans",
    chart: {
      name: "Women's Pants Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure your natural waist and fullest part of hips.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Waist", "Hips", "Inseam"],
          rows: [
            ["XS", "0-2",  "32-34", "4-6",   61, 86, 79],
            ["S",  "4-6",  "36-38", "8-10",  66, 91, 79],
            ["M",  "8-10", "40-42", "12-14", 71, 97, 79],
            ["L",  "12-14","44-46", "16-18", 76, 102,79],
            ["XL", "16-18","48-50", "20-22", 81, 107,79],
          ],
          units: { Waist: "cm", Hips: "cm", Inseam: "cm" },
        },
      ],
    },
  },
  {
    label: "👟 Shoes (Men)",
    chart: {
      name: "Men's Shoe Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure foot length from heel to longest toe.",
      tables: [
        {
          name: "Men",
          columns: ["US", "EU", "UK", "Foot Length"],
          rows: [
            ["6",   "39", "5.5", 24.0],
            ["7",   "40", "6.5", 25.0],
            ["8",   "41", "7.5", 26.0],
            ["9",   "42", "8.5", 27.0],
            ["10",  "43", "9.5", 27.9],
            ["11",  "44", "10.5",28.9],
            ["12",  "45", "11.5",29.8],
            ["13",  "46", "12.5",30.8],
          ],
          units: { "Foot Length": "cm" },
        },
      ],
    },
  },
  {
    label: "👟 Shoes (Women)",
    chart: {
      name: "Women's Shoe Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure foot length from heel to longest toe.",
      tables: [
        {
          name: "Women",
          columns: ["US", "EU", "UK", "Foot Length"],
          rows: [
            ["5",   "35", "2.5", 22.0],
            ["6",   "36", "3.5", 23.0],
            ["7",   "37", "4.5", 23.8],
            ["8",   "38", "5.5", 24.6],
            ["9",   "39", "6.5", 25.4],
            ["10",  "40", "7.5", 26.2],
            ["11",  "41", "8.5", 27.0],
          ],
          units: { "Foot Length": "cm" },
        },
      ],
    },
  },
  {
    label: "🧥 Jacket / Coat (Men)",
    chart: {
      name: "Men's Jacket Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Chest measured at fullest point. Sleeve from shoulder seam to wrist.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "EU", "Chest", "Waist", "Shoulder", "Sleeve"],
          rows: [
            ["XS", "44", 86,  76,  42, 63],
            ["S",  "46", 91,  81,  44, 64],
            ["M",  "48", 97,  86,  46, 65],
            ["L",  "50", 102, 91,  48, 66],
            ["XL", "52", 107, 97,  50, 67],
            ["2XL","54", 112, 102, 52, 68],
          ],
          units: { Chest: "cm", Waist: "cm", Shoulder: "cm", Sleeve: "cm" },
        },
      ],
    },
  },
  {
    label: "🧥 Jacket / Coat (Women)",
    chart: {
      name: "Women's Jacket Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure over a light layer for the best fit.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "Bust", "Waist", "Hips"],
          rows: [
            ["XS", "0-2",  "32-34", 81,  61, 86],
            ["S",  "4-6",  "36-38", 86,  66, 91],
            ["M",  "8-10", "40-42", 91,  71, 97],
            ["L",  "12-14","44-46", 97,  76, 102],
            ["XL", "16-18","48-50", 102, 81, 107],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm" },
        },
      ],
    },
  },
  {
    label: "🩲 Underwear / Briefs (Men)",
    chart: {
      name: "Men's Underwear Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure around the fullest part of your hips/seat.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip"],
          rows: [
            ["S",   "28-30", "4",  71-76,  86-91],
            ["M",   "32-34", "6",  81-86,  97-102],
            ["L",   "36-38", "8",  91-97,  107-112],
            ["XL",  "40-42", "10", 102-107,117-122],
          ],
          units: { Waist: "cm", Hip: "cm" },
        },
      ],
    },
  },
  {
    label: "🩱 Swimwear (Women)",
    chart: {
      name: "Women's Swimwear Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure bust, waist, and hips without clothing.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "Bust", "Waist", "Hips"],
          rows: [
            ["XS", "0-2",  "32", 79, 61, 86],
            ["S",  "4-6",  "34", 84, 66, 91],
            ["M",  "8-10", "36", 89, 71, 97],
            ["L",  "12-14","38", 94, 76, 102],
            ["XL", "16",   "40", 99, 81, 107],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm" },
        },
      ],
    },
  },
  {
    label: "🧦 Socks",
    chart: {
      name: "Sock Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Based on shoe size.",
      tables: [
        {
          name: "Unisex",
          columns: ["Sock Size", "US Shoe", "EU Shoe", "UK Shoe", "Foot Length"],
          rows: [
            ["S",   "4-6",   "36-38", "3-5",   22-24],
            ["M",   "7-9",   "39-42", "6-8",   25-27],
            ["L",   "10-12", "43-46", "9-11",  28-30],
            ["XL",  "13-15", "47-49", "12-14", 31-33],
          ],
          units: { "Foot Length": "cm" },
        },
      ],
    },
  },
  {
    label: "🧤 Gloves",
    chart: {
      name: "Glove Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure around the widest part of your hand (excluding thumb).",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Hand Circumference", "Hand Length"],
          rows: [
            ["XS", 16, 17],
            ["S",  18, 18],
            ["M",  20, 19],
            ["L",  22, 20],
            ["XL", 24, 21],
          ],
          units: { "Hand Circumference": "cm", "Hand Length": "cm" },
        },
      ],
    },
  },
  {
    label: "🎩 Hats / Caps",
    chart: {
      name: "Hat Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure around your head just above the ears.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US", "EU", "Head Circumference"],
          rows: [
            ["S",   "6⅝",  "53", 53],
            ["M",   "6¾",  "54", 54],
            ["M",   "6⅞",  "55", 55],
            ["L",   "7",   "56", 56],
            ["L",   "7⅛",  "57", 57],
            ["XL",  "7¼",  "58", 58],
            ["XL",  "7⅜",  "59", 59],
            ["2XL", "7½",  "60", 60],
          ],
          units: { "Head Circumference": "cm" },
        },
      ],
    },
  },
  {
    label: "💍 Rings",
    chart: {
      name: "Ring Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure the inner circumference of a ring that fits well.",
      tables: [
        {
          name: "Unisex",
          columns: ["US Size", "EU Size", "UK Size", "Inner Circumference", "Inner Diameter"],
          rows: [
            ["5",  "49", "J",  49.3, 15.7],
            ["6",  "51", "L",  51.9, 16.5],
            ["7",  "54", "N",  54.4, 17.3],
            ["8",  "57", "P",  57.0, 18.1],
            ["9",  "59", "R",  59.5, 18.9],
            ["10", "62", "T",  62.1, 19.8],
            ["11", "64", "V",  64.6, 20.6],
            ["12", "67", "X",  67.2, 21.4],
          ],
          units: { "Inner Circumference": "cm", "Inner Diameter": "cm" },
        },
      ],
    },
  },
  {
    label: "👙 Bra (Women)",
    chart: {
      name: "Women's Bra Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure underbust and fullest bust. Band = underbust, cup = bust - underbust.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Band", "Bust"],
          rows: [
            ["32A", "32A", "70A", "32A", 70, 82],
            ["32B", "32B", "70B", "32B", 70, 84],
            ["34A", "34A", "75A", "34A", 75, 87],
            ["34B", "34B", "75B", "34B", 75, 89],
            ["36A", "36A", "80A", "36A", 80, 92],
            ["36B", "36B", "80B", "36B", 80, 94],
            ["36C", "36C", "80C", "36C", 80, 96],
            ["38B", "38B", "85B", "38B", 85, 99],
            ["38C", "38C", "85C", "38C", 85, 101],
          ],
          units: { Band: "cm", Bust: "cm" },
        },
      ],
    },
  },
  {
    label: "🩲 Panty / Briefs (Women)",
    chart: {
      name: "Women's Panty Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure natural waist and fullest part of hips.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Waist", "Hips"],
          rows: [
            ["XS", "0-2",  "32-34", "4-6",   61, 86],
            ["S",  "4-6",  "36-38", "8-10",  66, 91],
            ["M",  "8-10", "40-42", "12-14", 71, 97],
            ["L",  "12-14","44-46", "16-18", 76, 102],
            ["XL", "16-18","48-50", "20-22", 81, 107],
          ],
          units: { Waist: "cm", Hips: "cm" },
        },
      ],
    },
  },
  {
    label: "👖 Jeans (Unisex)",
    chart: {
      name: "Jeans Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Waist measured at natural waistline. Inseam from crotch to ankle.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip", "Inseam"],
          rows: [
            ["28", "28", "44", 71, 86, 81],
            ["30", "30", "46", 76, 91, 81],
            ["32", "32", "48", 81, 97, 81],
            ["34", "34", "50", 86, 102,81],
            ["36", "36", "52", 91, 107,81],
            ["38", "38", "54", 97, 112,81],
          ],
          units: { Waist: "cm", Hip: "cm", Inseam: "cm" },
        },
      ],
    },
  },
  {
    label: "⌚ Watches / Bracelets",
    chart: {
      name: "Watch Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure wrist circumference.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Wrist Circumference", "Case Diameter"],
          rows: [
            ["XS", 14, 36],
            ["S",  15, 38],
            ["M",  17, 40],
            ["L",  19, 42],
            ["XL", 21, 44],
          ],
          units: { "Wrist Circumference": "cm", "Case Diameter": "mm" },
        },
      ],
    },
  },
  {
    label: "👓 Eyewear / Glasses",
    chart: {
      name: "Eyewear Size Guide",
      default_unit: "mm",
      size_systems: ["US", "EU"],
      fit_notes: "Lens width - bridge width - temple length (mm).",
      tables: [
        {
          name: "Unisex",
          columns: ["Frame Size", "Lens Width", "Bridge Width", "Temple Length"],
          rows: [
            ["Small",  49, 18, 135],
            ["Medium", 52, 20, 140],
            ["Large",  55, 22, 145],
            ["X-Large",58, 24, 150],
          ],
          units: { "Lens Width": "mm", "Bridge Width": "mm", "Temple Length": "mm" },
        },
      ],
    },
  },
  {
    label: "👔 Belts",
    chart: {
      name: "Belt Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure waist over clothing where belt sits.",
      tables: [
        {
          name: "Unisex",
          columns: ["Belt Size", "US Waist", "EU", "Waist"],
          rows: [
            ["S",   "28-30", "70-75", 71-76],
            ["M",   "32-34", "80-85", 81-86],
            ["L",   "36-38", "90-95", 91-97],
            ["XL",  "40-42", "100-105", 102-107],
            ["2XL", "44-46", "110-115", 112-117],
          ],
          units: { Waist: "cm" },
        },
      ],
    },
  },
];
