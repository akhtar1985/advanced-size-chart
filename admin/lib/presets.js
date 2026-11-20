import { diagramForPreset } from './measureDiagrams.js';

// Measurements are stored in the chart's base unit: cm unless noted (mm for eyewear).
// Ranges are strings so "86-91" stays a range instead of being evaluated as arithmetic.

export const PRESET_CATEGORIES = [
  { key: 'tops', label: 'Tops & T-shirts' },
  { key: 'bottoms', label: 'Bottoms, pants & jeans' },
  { key: 'dresses', label: 'Dresses' },
  { key: 'outerwear', label: 'Jackets & outerwear' },
  { key: 'underwear', label: 'Underwear & swimwear' },
  { key: 'kids', label: 'Kids & baby' },
  { key: 'footwear', label: 'Shoes & socks' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'eyewear', label: 'Glasses & sunglasses' },
];

export const PRESETS = [
  {
    label: "T-shirt",
    category: "tops",
    keywords: ["tshirt", "t shirt", "tee", "top", "unisex", "cotton"],
    description: "Chest, length, shoulder and sleeve with XS–3XL",
    chart: {
      name: "T-Shirt Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "For a relaxed fit, size up one size.",
      measure_instructions: "Lay a t-shirt flat. Chest: across the chest 2 cm below the armhole. Length: from the highest shoulder point to the hem. Shoulder: seam to seam across the back. Sleeve: from the shoulder seam to the sleeve end.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
          rows: [
            ["XS", 86, 66, 40, 20],
            ["S", 91, 69, 42, 21],
            ["M", 97, 71, 44, 22],
            ["L", 102, 74, 46, 23],
            ["XL", 107, 76, 48, 24],
            ["2XL", 112, 79, 50, 25],
            ["3XL", 117, 81, 52, 26],
          ],
          units: { Chest: "cm", Length: "cm", Shoulder: "cm", Sleeve: "cm" },
        },
      ],
    },
  },
  {
    label: "Dress shirt",
    category: "tops",
    keywords: ["shirt", "formal", "button", "men", "office"],
    description: "Neck, chest, waist, shoulder, sleeve and length",
    chart: {
      name: "Dress Shirt Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Measure around the fullest part of your chest and the base of your neck.",
      measure_instructions: "Neck: around the base of the neck with one finger of space. Chest: around the fullest part. Waist: around the natural waist. Shoulder: seam to seam across the back. Sleeve: from the shoulder seam to the wrist bone. Length: from the collar seam to the hem.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "Neck", "Chest", "Waist", "Shoulder", "Sleeve", "Length"],
          rows: [
            ["S", 37, 91, 76, 44, 63, 76],
            ["M", 39, 97, 81, 45, 64, 78],
            ["L", 41, 102, 86, 46, 65, 80],
            ["XL", 43, 107, 91, 48, 66, 82],
            ["2XL", 45, 112, 97, 50, 67, 84],
          ],
          units: { Neck: "cm", Chest: "cm", Waist: "cm", Shoulder: "cm", Sleeve: "cm", Length: "cm" },
        },
      ],
    },
  },
  {
    label: "Women's top",
    category: "tops",
    keywords: ["top", "blouse", "women", "ladies", "tshirt"],
    description: "Bust, waist, hips, length and sleeve with US/EU/UK",
    chart: {
      name: "Women's Top Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure around the fullest part of your bust.",
      measure_instructions: "Bust: around the fullest part of the bust, keeping the tape level. Waist: around the narrowest part of the waist. Hips: around the fullest part. Length: from the highest shoulder point to the hem. Sleeve: from the shoulder seam to the sleeve end.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Bust", "Waist", "Hips", "Length", "Sleeve"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 81, 61, 86, 58, 16],
            ["S", "4-6", "36-38", "8-10", 86, 66, 91, 60, 17],
            ["M", "8-10", "40-42", "12-14", 91, 71, 97, 62, 18],
            ["L", "12-14", "44-46", "16-18", 97, 76, 102, 64, 19],
            ["XL", "16-18", "48-50", "20-22", 102, 81, 107, 66, 20],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm", Length: "cm", Sleeve: "cm" },
        },
      ],
    },
  },
  {
    label: "Hoodie & sweatshirt",
    category: "tops",
    keywords: ["hoodie", "sweatshirt", "fleece", "pullover", "sweater", "top"],
    description: "Relaxed chest, waist, length, shoulder and sleeve",
    chart: {
      name: "Hoodie Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Designed for a relaxed fit. Choose your usual size, or size up for an oversized look.",
      measure_instructions: "Lay the hoodie flat and close the zip or buttons. Chest: across the chest 2 cm below the armhole. Waist: across the hem. Length: from the highest shoulder point to the hem. Shoulder: seam to seam. Sleeve: from the shoulder seam to the cuff.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Chest", "Waist", "Length", "Shoulder", "Sleeve"],
          rows: [
            ["XS", 96, 86, 64, 42, 59],
            ["S", 102, 91, 66, 44, 60],
            ["M", 108, 97, 68, 46, 61],
            ["L", 114, 102, 70, 48, 62],
            ["XL", 120, 107, 72, 50, 63],
            ["2XL", 126, 112, 74, 52, 64],
          ],
          units: { Chest: "cm", Waist: "cm", Length: "cm", Shoulder: "cm", Sleeve: "cm" },
        },
      ],
    },
  },
  {
    label: "Men's pants",
    category: "bottoms",
    keywords: ["pants", "trousers", "men", "chino", "formal"],
    description: "Waist, hip, thigh, inseam and rise",
    chart: {
      name: "Men's Pants Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Waist measured at natural waistline. Inseam from crotch to ankle.",
      measure_instructions: "Waist: around the natural waistline. Hip: around the fullest part of the seat. Thigh: around the fullest part of the thigh, 2 cm below the crotch. Inseam: from the crotch seam to the ankle. Rise: from the crotch seam to the top of the waistband.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip", "Thigh", "Inseam", "Rise"],
          rows: [
            ["S", "28-30", "44-46", 74, 91, 56, 81, 26],
            ["M", "32-34", "48-50", 84, 97, 58, 81, 27],
            ["L", "36-38", "52-54", 94, 104, 60, 81, 28],
            ["XL", "40-42", "56-58", 104, 111, 62, 81, 29],
            ["2XL", "44-46", "60-62", 114, 118, 64, 81, 30],
          ],
          units: { Waist: "cm", Hip: "cm", Thigh: "cm", Inseam: "cm", Rise: "cm" },
        },
      ],
    },
  },
  {
    label: "Women's pants",
    category: "bottoms",
    keywords: ["pants", "trousers", "women", "ladies", "jence"],
    description: "Waist, hips, thigh, inseam and rise with US/EU/UK",
    chart: {
      name: "Women's Pants Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure your natural waist and fullest part of hips.",
      measure_instructions: "Waist: around the narrowest part of the waist. Hips: around the fullest part of the seat. Thigh: around the fullest part of the thigh, 2 cm below the crotch. Inseam: from the crotch seam to the ankle. Rise: from the crotch seam to the top of the waistband.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Waist", "Hips", "Thigh", "Inseam", "Rise"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 61, 86, 50, 79, 24],
            ["S", "4-6", "36-38", "8-10", 66, 91, 52, 79, 25],
            ["M", "8-10", "40-42", "12-14", 71, 97, 54, 79, 26],
            ["L", "12-14", "44-46", "16-18", 76, 102, 56, 79, 27],
            ["XL", "16-18", "48-50", "20-22", 81, 107, 58, 79, 28],
          ],
          units: { Waist: "cm", Hips: "cm", Thigh: "cm", Inseam: "cm", Rise: "cm" },
        },
      ],
    },
  },
  {
    label: "Jeans (unisex)",
    category: "bottoms",
    keywords: ["jeans", "jence", "denim", "waist size", "unisex"],
    description: "Waist-size denim with hip, thigh, inseam and rise",
    chart: {
      name: "Jeans Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Waist measured at natural waistline. Inseam from crotch to ankle. Denim relaxes slightly with wear.",
      measure_instructions: "Waist: around the natural waistline. Hip: around the fullest part of the seat. Thigh: around the fullest part of the thigh, 2 cm below the crotch. Inseam: from the crotch seam to the ankle. Rise: from the crotch seam to the top of the waistband.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip", "Thigh", "Inseam", "Rise"],
          rows: [
            ["28", "28", "44", 71, 86, 54, 81, 25],
            ["30", "30", "46", 76, 91, 56, 81, 26],
            ["32", "32", "48", 81, 97, 58, 81, 27],
            ["34", "34", "50", 86, 102, 60, 81, 28],
            ["36", "36", "52", 91, 107, 62, 81, 29],
            ["38", "38", "54", 97, 112, 64, 81, 30],
          ],
          units: { Waist: "cm", Hip: "cm", Thigh: "cm", Inseam: "cm", Rise: "cm" },
        },
      ],
    },
  },
  {
    label: "Skirt",
    category: "bottoms",
    keywords: ["skirt", "bottom wear", "bottomwear", "women", "midi", "mini"],
    description: "Bottom wear with waist, hips and length",
    chart: {
      name: "Skirt Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure your natural waist and the fullest part of your hips. Length is measured from the waistband down.",
      measure_instructions: "Waist: around your natural waist where the skirt sits. Hips: around the fullest part of your hips. Length: from the top of the waistband to the hem.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Waist", "Hips", "Length"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 61, 86, 45],
            ["S", "4-6", "36-38", "8-10", 66, 91, 46],
            ["M", "8-10", "40-42", "12-14", 71, 97, 47],
            ["L", "12-14", "44-46", "16-18", 76, 102, 48],
            ["XL", "16-18", "48-50", "20-22", 81, 107, 49],
          ],
          units: { Waist: "cm", Hips: "cm", Length: "cm" },
        },
      ],
    },
  },
  {
    label: "Shorts",
    category: "bottoms",
    keywords: ["shorts", "bottom wear", "bottomwear", "summer", "unisex"],
    description: "Bottom wear with waist, hip, thigh, inseam and rise",
    chart: {
      name: "Shorts Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure your waist where the shorts sit and your fullest hip.",
      measure_instructions: "Waist: around the waist where the shorts sit. Hip: around the fullest part of the seat. Thigh: around the fullest part of the thigh, 2 cm below the crotch. Inseam: from the crotch seam to the hem. Rise: from the crotch seam to the top of the waistband.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US Waist", "EU", "Waist", "Hip", "Thigh", "Inseam", "Rise"],
          rows: [
            ["S", "28-30", "44-46", 74, 96, 58, 18, 25],
            ["M", "32-34", "48-50", 84, 102, 60, 19, 26],
            ["L", "36-38", "52-54", 94, 108, 62, 20, 27],
            ["XL", "40-42", "56-58", 104, 114, 64, 21, 28],
          ],
          units: { Waist: "cm", Hip: "cm", Thigh: "cm", Inseam: "cm", Rise: "cm" },
        },
      ],
    },
  },
  {
    label: "Dress",
    category: "dresses",
    keywords: ["dress", "gown", "women", "one piece", "midi"],
    description: "Bust, waist, hips and length with US/EU/UK",
    chart: {
      name: "Dress Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure over light clothing. For a loose fit, choose one size up.",
      measure_instructions: "Bust: around the fullest part of the bust. Waist: around the narrowest part of the waist. Hips: around the fullest part of the hips. Length: from the highest shoulder point to the hem.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Bust", "Waist", "Hips", "Length"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 81, 61, 86, 95],
            ["S", "4-6", "36-38", "8-10", 86, 66, 91, 97],
            ["M", "8-10", "40-42", "12-14", 91, 71, 97, 99],
            ["L", "12-14", "44-46", "16-18", 97, 76, 102, 101],
            ["XL", "16-18", "48-50", "20-22", 102, 81, 107, 103],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm", Length: "cm" },
        },
      ],
    },
  },
  {
    label: "Jacket (men)",
    category: "outerwear",
    keywords: ["jacket", "coat", "outerwear", "men", "blazer"],
    description: "Chest, waist, shoulder, sleeve and length",
    chart: {
      name: "Men's Jacket Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Chest measured at fullest point. Sleeve from shoulder seam to wrist.",
      measure_instructions: "Chest: around the fullest part of the chest. Waist: around the natural waist. Shoulder: seam to seam across the back. Sleeve: from the shoulder seam to the wrist bone. Length: from the collar seam to the hem.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "EU", "Chest", "Waist", "Shoulder", "Sleeve", "Length"],
          rows: [
            ["XS", "44", 86, 76, 42, 63, 64],
            ["S", "46", 91, 81, 44, 64, 66],
            ["M", "48", 97, 86, 46, 65, 68],
            ["L", "50", 102, 91, 48, 66, 70],
            ["XL", "52", 107, 97, 50, 67, 72],
            ["2XL", "54", 112, 102, 52, 68, 74],
          ],
          units: { Chest: "cm", Waist: "cm", Shoulder: "cm", Sleeve: "cm", Length: "cm" },
        },
      ],
    },
  },
  {
    label: "Jacket (women)",
    category: "outerwear",
    keywords: ["jacket", "coat", "outerwear", "women", "blazer"],
    description: "Bust, waist, hips, sleeve and length",
    chart: {
      name: "Women's Jacket Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure over a light layer for the best fit.",
      measure_instructions: "Bust: around the fullest part of the bust. Waist: around the narrowest part of the waist. Hips: around the fullest part of the hips. Sleeve: from the shoulder seam to the wrist bone. Length: from the collar seam to the hem.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Bust", "Waist", "Hips", "Sleeve", "Length"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 81, 61, 86, 59, 65],
            ["S", "4-6", "36-38", "8-10", 86, 66, 91, 60, 67],
            ["M", "8-10", "40-42", "12-14", 91, 71, 97, 61, 69],
            ["L", "12-14", "44-46", "16-18", 97, 76, 102, 62, 71],
            ["XL", "16-18", "48-50", "20-22", 102, 81, 107, 63, 73],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm", Sleeve: "cm", Length: "cm" },
        },
      ],
    },
  },
  {
    label: "Underwear (men)",
    category: "underwear",
    keywords: ["underwear", "briefs", "boxer", "men", "innerwear"],
    description: "Briefs with waist and hip ranges",
    chart: {
      name: "Men's Underwear Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Measure around the fullest part of your hips.",
      measure_instructions: "Waist: around the natural waistline. Hip: around the fullest part of the seat. Keep the tape level and snug but not tight.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "US Waist", "Waist", "Hip"],
          rows: [
            ["S", "28-30", "71-76", "86-91"],
            ["M", "32-34", "81-86", "97-102"],
            ["L", "36-38", "91-97", "107-112"],
            ["XL", "40-42", "102-107", "117-122"],
          ],
          units: { Waist: "cm", Hip: "cm" },
        },
      ],
    },
  },
  {
    label: "Bra",
    category: "underwear",
    keywords: ["bra", "lingerie", "cup", "band", "women"],
    description: "Band and bust measurements",
    chart: {
      name: "Women's Bra Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Band is measured under the bust. Cup size is bust minus band.",
      measure_instructions: "Band: snugly around the ribcage directly under the bust. Bust: around the fullest part of the bust. Keep the tape level and parallel to the floor.",
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
    label: "Panty",
    category: "underwear",
    keywords: ["panty", "panties", "underwear", "women"],
    description: "Waist and hip measurements",
    chart: {
      name: "Women's Panty Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure natural waist and fullest part of hips.",
      measure_instructions: "Waist: around the narrowest part of the waist. Hips: around the fullest part of the hips. Keep the tape level and snug.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Waist", "Hips"],
          rows: [
            ["XS", "0-2", "32-34", "4-6", 61, 86],
            ["S", "4-6", "36-38", "8-10", 66, 91],
            ["M", "8-10", "40-42", "12-14", 71, 97],
            ["L", "12-14", "44-46", "16-18", 76, 102],
            ["XL", "16-18", "48-50", "20-22", 81, 107],
          ],
          units: { Waist: "cm", Hips: "cm" },
        },
      ],
    },
  },
  {
    label: "Swimwear (women)",
    category: "underwear",
    keywords: ["swimwear", "swimsuit", "bikini", "beach", "women"],
    description: "Bust, waist, hips and torso length",
    chart: {
      name: "Women's Swimwear Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure bust, waist and hips without clothing. Swimwear fits close to the body.",
      measure_instructions: "Bust: around the fullest part of the bust. Waist: around the narrowest part of the waist. Hips: around the fullest part of the hips. Torso length: from the shoulder, through the crotch, back to the same shoulder.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "Bust", "Waist", "Hips", "Torso Length"],
          rows: [
            ["XS", "0-2", "32", 79, 61, 86, 145],
            ["S", "4-6", "34", 84, 66, 91, 150],
            ["M", "8-10", "36", 89, 71, 97, 155],
            ["L", "12-14", "38", 94, 76, 102, 160],
            ["XL", "16", "40", 99, 81, 107, 165],
          ],
          units: { Bust: "cm", Waist: "cm", Hips: "cm", "Torso Length": "cm" },
        },
      ],
    },
  },
  {
    label: "Shoes (men)",
    category: "footwear",
    keywords: ["shoes", "shoe", "footwear", "sneaker", "men"],
    description: "US, EU and UK sizes with foot length and width",
    chart: {
      name: "Men's Shoe Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure foot length from heel to longest toe. Wear the socks you plan to use.",
      measure_instructions: "Stand on a sheet of paper with your heel against a wall. Mark the longest toe and measure heel to toe. Foot width: measure across the widest part of the ball of the foot.",
      tables: [
        {
          name: "Men",
          columns: ["Size", "US", "EU", "UK", "Foot Length", "Foot Width"],
          rows: [
            ["6", "6", "39", "5.5", 24, 9.4],
            ["7", "7", "40", "6.5", 25, 9.6],
            ["8", "8", "41", "7.5", 26, 9.8],
            ["9", "9", "42", "8.5", 27, 10],
            ["10", "10", "43", "9.5", 27.9, 10.2],
            ["11", "11", "44", "10.5", 28.9, 10.4],
            ["12", "12", "45", "11.5", 29.8, 10.6],
            ["13", "13", "46", "12.5", 30.8, 10.8],
          ],
          units: { "Foot Length": "cm", "Foot Width": "cm" },
        },
      ],
    },
  },
  {
    label: "Shoes (women)",
    category: "footwear",
    keywords: ["shoes", "shoe", "footwear", "heels", "women"],
    description: "US, EU and UK sizes with foot length and width",
    chart: {
      name: "Women's Shoe Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure foot length from heel to longest toe. Wear the socks you plan to use.",
      measure_instructions: "Stand on a sheet of paper with your heel against a wall. Mark the longest toe and measure heel to toe. Foot width: measure across the widest part of the ball of the foot.",
      tables: [
        {
          name: "Women",
          columns: ["Size", "US", "EU", "UK", "Foot Length", "Foot Width"],
          rows: [
            ["5", "5", "35", "2.5", 22, 8.6],
            ["6", "6", "36", "3.5", 23, 8.8],
            ["7", "7", "37", "4.5", 23.8, 9],
            ["8", "8", "38", "5.5", 24.6, 9.2],
            ["9", "9", "39", "6.5", 25.4, 9.4],
            ["10", "10", "40", "7.5", 26.2, 9.5],
            ["11", "11", "41", "8.5", 27, 9.6],
          ],
          units: { "Foot Length": "cm", "Foot Width": "cm" },
        },
      ],
    },
  },
  {
    label: "Socks",
    category: "footwear",
    keywords: ["socks", "sock", "footwear", "unisex"],
    description: "Based on shoe size and foot length",
    chart: {
      name: "Sock Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Based on shoe size.",
      measure_instructions: "Use your usual shoe size for US, EU and UK, or measure foot length from heel to longest toe.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US", "EU", "UK", "Foot Length"],
          rows: [
            ["S", "4-6", "36-38", "3-5", "22-24"],
            ["M", "7-9", "39-42", "6-8", "25-27"],
            ["L", "10-12", "43-46", "9-11", "28-30"],
            ["XL", "13-15", "47-49", "12-14", "31-33"],
          ],
          units: { "Foot Length": "cm" },
        },
      ],
    },
  },
  {
    label: "Belts",
    category: "accessories",
    keywords: ["belt", "accessories", "waist", "leather"],
    description: "Waist range and belt length",
    chart: {
      name: "Belt Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure your waist over clothing where the belt sits. If between sizes, choose the larger one.",
      measure_instructions: "Waist: measure over the clothing you will wear with the belt, where it sits. Belt length: from the buckle to the middle hole of your current favourite belt.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US Waist", "EU", "Waist", "Belt Length"],
          rows: [
            ["S", "28-30", "70-75", "71-76", 80],
            ["M", "32-34", "80-85", "81-86", 90],
            ["L", "36-38", "90-95", "91-97", 100],
            ["XL", "40-42", "100-105", "102-107", 110],
            ["2XL", "44-46", "110-115", "112-117", 120],
          ],
          units: { Waist: "cm", "Belt Length": "cm" },
        },
      ],
    },
  },
  {
    label: "Gloves",
    category: "accessories",
    keywords: ["gloves", "hands", "winter", "accessories"],
    description: "Hand circumference and length",
    chart: {
      name: "Glove Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Measure around the widest part of your hand, excluding the thumb.",
      measure_instructions: "Hand circumference: around the widest part of the palm, excluding the thumb. Hand length: from the base of the palm to the tip of the middle finger.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Hand Circumference", "Hand Length"],
          rows: [
            ["XS", 16, 17],
            ["S", 18, 18],
            ["M", 20, 19],
            ["L", 22, 20],
            ["XL", 24, 21],
          ],
          units: { "Hand Circumference": "cm", "Hand Length": "cm" },
        },
      ],
    },
  },
  {
    label: "Hats",
    category: "accessories",
    keywords: ["hat", "cap", "beanie", "head", "accessories"],
    description: "US and EU hat sizes with head circumference",
    chart: {
      name: "Hat Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU"],
      fit_notes: "Measure around your head just above the ears.",
      measure_instructions: "Head circumference: wrap the tape around your head, just above the ears and across the middle of the forehead. Keep the tape snug and level.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "US", "EU", "Head Circumference"],
          rows: [
            ["S", "6⅝", "53", 53],
            ["S/M", "6¾", "54", 54],
            ["M", "6⅞", "55", 55],
            ["L", "7", "56", 56],
            ["L/XL", "7⅛", "57", 57],
            ["XL", "7¼", "58", 58],
            ["2XL", "7⅜", "59", 59],
          ],
          units: { "Head Circumference": "cm" },
        },
      ],
    },
  },
  {
    label: "Rings",
    category: "accessories",
    keywords: ["ring", "jewellery", "jewelry", "finger", "accessories"],
    description: "US, EU and UK ring sizes with inner diameter",
    chart: {
      name: "Ring Size Guide",
      default_unit: "cm",
      size_systems: ["US", "EU", "UK"],
      fit_notes: "Measure the inner circumference of a ring that fits well.",
      measure_instructions: "Measure the inside diameter of a ring that fits the intended finger. Match the diameter to the table, or measure the inner circumference and divide by π (3.14).",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "EU", "UK", "Inner Circumference", "Inner Diameter"],
          rows: [
            ["5", "49", "J", 4.93, 1.57],
            ["6", "51", "L", 5.19, 1.65],
            ["7", "54", "N", 5.44, 1.73],
            ["8", "57", "P", 5.7, 1.81],
            ["9", "59", "R", 5.95, 1.89],
            ["10", "62", "T", 6.21, 1.98],
            ["11", "64", "V", 6.46, 2.06],
            ["12", "67", "X", 6.72, 2.14],
          ],
          units: { "Inner Circumference": "cm", "Inner Diameter": "cm" },
        },
      ],
    },
  },
  {
    label: "Watches & bracelets",
    category: "accessories",
    keywords: ["watch", "watches", "bracelet", "wrist", "band"],
    description: "Wrist circumference, case and band width",
    chart: {
      name: "Watch Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Measure wrist circumference where the watch sits. A comfortable fit leaves room for one finger under the strap.",
      measure_instructions: "Wrist: around the wrist bone where the watch sits. Case diameter: across the watch case, excluding the crown. Band width: the width of the strap at the lugs in millimetres (printed as the second number, e.g. 22 mm).",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Wrist Circumference", "Case Diameter", "Band Width"],
          rows: [
            ["XS", 14, 36, 12],
            ["S", 15, 38, 14],
            ["M", 17, 40, 18],
            ["L", 19, 42, 20],
            ["XL", 21, 44, 22],
          ],
          units: { "Wrist Circumference": "cm", "Case Diameter": "mm", "Band Width": "mm" },
        },
      ],
    },
  },
  {
    label: "Eyewear (frames)",
    category: "eyewear",
    keywords: ["eyewear", "glasses", "spectacles", "frame", "optical"],
    description: "Lens, bridge, temple and frame width in millimetres",
    chart: {
      name: "Eyewear Size Guide",
      default_unit: "mm",
      size_systems: ["US"],
      fit_notes: "Frame measurements are printed on the inside of the temple arm as lens-bridge-temple.",
      measure_instructions: "Lens width: the widest part of one lens. Bridge width: between the lenses. Temple length: from the hinge to the end of the arm. Frame width: from the outer edge of one lens to the other.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Lens Width", "Bridge Width", "Temple Length", "Frame Width"],
          rows: [
            ["Small", 49, 18, 135, 132],
            ["Medium", 52, 20, 140, 138],
            ["Large", 55, 22, 145, 142],
            ["X-Large", 58, 24, 150, 148],
          ],
          units: { "Lens Width": "mm", "Bridge Width": "mm", "Temple Length": "mm", "Frame Width": "mm" },
        },
      ],
    },
  },
  {
    label: "Sunglasses",
    category: "eyewear",
    keywords: ["sunglasses", "sunglass", "sunglases", "shades", "eyewear"],
    description: "Lens, bridge, temple and frame width in millimetres",
    chart: {
      name: "Sunglasses Size Guide",
      default_unit: "mm",
      size_systems: ["US"],
      fit_notes: "Sunglass sizes are printed on the inside of the temple arm as lens-bridge-temple, for example 52-20-145.",
      measure_instructions: "Lens width: the widest part of one lens. Bridge width: between the lenses. Temple length: from the hinge to the end of the arm. Frame width: from the outer edge of one lens to the other.",
      tables: [
        {
          name: "Unisex",
          columns: ["Size", "Lens Width", "Bridge Width", "Temple Length", "Frame Width"],
          rows: [
            ["Small", 49, 19, 140, 132],
            ["Medium", 52, 20, 145, 138],
            ["Large", 55, 21, 145, 142],
            ["X-Large", 58, 22, 150, 148],
          ],
          units: { "Lens Width": "mm", "Bridge Width": "mm", "Temple Length": "mm", "Frame Width": "mm" },
        },
      ],
    },
  },
  {
    label: "Kids T-shirt",
    category: "kids",
    keywords: ["kids", "children", "child", "toddler", "baby", "tshirt", "t shirt", "tee", "boys", "girls"],
    description: "Chest, length and sleeve for 2T–12 with a height and weight guide",
    chart: {
      name: "Kids T-Shirt Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Kids sizes follow height more than age. If your child is between sizes, choose the larger size for room to grow.",
      measure_instructions: "Lay the t-shirt flat. Chest: across the chest 2 cm below the armhole. Length: from the highest shoulder point to the hem. Sleeve: from the shoulder seam to the sleeve end.",
      tables: [
        {
          name: "Kids",
          columns: ["Size", "Chest", "Length", "Sleeve"],
          rows: [
            ["2T", 53, 38, 11],
            ["3T", 55, 40, 12],
            ["4T", 57, 42, 13],
            ["5", 59, 44, 14],
            ["6", 61, 46, 15],
            ["7", 63, 48, 16],
            ["8", 66, 50, 17],
            ["10", 70, 54, 18],
            ["12", 74, 58, 19],
          ],
          units: { Chest: "cm", Length: "cm", Sleeve: "cm" },
          heightWeight: {
            heightUnit: "cm",
            weightUnit: "kg",
            rows: [
              { size: "2T", heightMin: "86", heightMax: "92", weightMin: "12", weightMax: "14.5" },
              { size: "3T", heightMin: "92", heightMax: "98", weightMin: "14", weightMax: "16.5" },
              { size: "4T", heightMin: "98", heightMax: "104", weightMin: "16", weightMax: "18.5" },
              { size: "5", heightMin: "104", heightMax: "110", weightMin: "18", weightMax: "21" },
              { size: "6", heightMin: "110", heightMax: "116", weightMin: "21", weightMax: "24" },
              { size: "7", heightMin: "116", heightMax: "122", weightMin: "24", weightMax: "27" },
              { size: "8", heightMin: "122", heightMax: "128", weightMin: "27", weightMax: "31" },
              { size: "10", heightMin: "128", heightMax: "137", weightMin: "31", weightMax: "38" },
              { size: "12", heightMin: "137", heightMax: "146", weightMin: "38", weightMax: "47" },
            ],
          },
        },
      ],
    },
  },
  {
    label: "Baby bodysuit",
    category: "kids",
    keywords: ["baby", "bodysuit", "onesie", "romper", "infant", "newborn", "toddler", "months"],
    description: "0–3M to 18–24M with chest, length, sleeve and a weight guide",
    chart: {
      name: "Baby Bodysuit Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Baby sizes are a guide — weight usually matters more than age. If between sizes, choose the larger one.",
      measure_instructions: "Lay the bodysuit flat. Chest: across the chest just below the armholes. Length: from the shoulder to the bottom of the snaps. Sleeve: from the shoulder seam to the sleeve end.",
      tables: [
        {
          name: "Baby",
          columns: ["Size", "Chest", "Length", "Sleeve"],
          rows: [
            ["0-3M", 40, 50, 15],
            ["3-6M", 43, 56, 17],
            ["6-9M", 46, 62, 19],
            ["9-12M", 48, 66, 21],
            ["12-18M", 50, 70, 23],
            ["18-24M", 52, 74, 25],
          ],
          units: { Chest: "cm", Length: "cm", Sleeve: "cm" },
          heightWeight: {
            heightUnit: "cm",
            weightUnit: "kg",
            rows: [
              { size: "0-3M", heightMin: "50", heightMax: "60", weightMin: "3", weightMax: "5.5" },
              { size: "3-6M", heightMin: "60", heightMax: "67", weightMin: "5.5", weightMax: "8" },
              { size: "6-9M", heightMin: "67", heightMax: "72", weightMin: "8", weightMax: "9.5" },
              { size: "9-12M", heightMin: "72", heightMax: "78", weightMin: "9.5", weightMax: "11" },
              { size: "12-18M", heightMin: "78", heightMax: "84", weightMin: "11", weightMax: "12.5" },
              { size: "18-24M", heightMin: "84", heightMax: "90", weightMin: "12.5", weightMax: "14" },
            ],
          },
        },
      ],
    },
  },
  {
    label: "Kids pants",
    category: "kids",
    keywords: ["kids", "children", "pants", "trousers", "jeans", "leggings", "toddler", "boys", "girls"],
    description: "Waist, hip and inseam for 2T–12",
    chart: {
      name: "Kids Pants Size Guide",
      default_unit: "cm",
      size_systems: ["US"],
      fit_notes: "Elastic waists sit close to the body. Check the inseam if your child is tall for their age.",
      measure_instructions: "Waist: around the narrowest part of the waist, over the tummy. Hip: around the fullest part of the seat. Inseam: from the crotch seam to the bottom of the hem.",
      tables: [
        {
          name: "Kids",
          columns: ["Size", "Waist", "Hip", "Inseam"],
          rows: [
            ["2T", 50, 54, 34],
            ["3T", 51, 56, 37],
            ["4T", 52, 58, 40],
            ["5", 53, 60, 44],
            ["6", 54, 62, 48],
            ["7", 55, 64, 52],
            ["8", 57, 67, 56],
            ["10", 59, 71, 62],
            ["12", 62, 76, 68],
          ],
          units: { Waist: "cm", Hip: "cm", Inseam: "cm" },
        },
      ],
    },
  },
];

for (const preset of PRESETS) {
  if (!preset.chart.measure_image) preset.chart.measure_image = diagramForPreset(preset);
}

export const PRESET_COUNT = PRESETS.length;

export const PRESET_GROUPS = PRESET_CATEGORIES.map((category) => ({
  ...category,
  presets: PRESETS.map((preset, index) => ({ ...preset, index })).filter((preset) => preset.category === category.key),
})).filter((group) => group.presets.length > 0);

export function presetSearchText(preset) {
  return [preset.label, preset.description, ...(preset.keywords ?? [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
