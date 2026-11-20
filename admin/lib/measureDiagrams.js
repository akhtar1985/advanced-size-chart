export const MEASURE_DIAGRAMS = [
  { file: 'measure-tops.svg', label: 'Top — chest, shoulder, sleeve, length' },
  { file: 'measure-bottoms.svg', label: 'Bottoms — waist, hip, inseam' },
  { file: 'measure-dresses.svg', label: 'Dress — bust, waist, hip, length' },
  { file: 'measure-outerwear.svg', label: 'Jacket — chest, shoulder, sleeve, length' },
  { file: 'measure-bra.svg', label: 'Bra — bust, underbust' },
  { file: 'measure-footwear.svg', label: 'Foot — length, width' },
  { file: 'measure-belts.svg', label: 'Belt — belt length, waist' },
  { file: 'measure-gloves.svg', label: 'Glove — hand length, palm width' },
  { file: 'measure-headwear.svg', label: 'Hat — head circumference' },
  { file: 'measure-circumference.svg', label: 'Ring or bracelet — circumference, diameter' },
  { file: 'measure-eyewear.svg', label: 'Glasses — lens, bridge, temple, frame' },
];

const BY_LABEL = {
  'T-shirt': 'measure-tops.svg',
  'Dress shirt': 'measure-tops.svg',
  "Women's top": 'measure-tops.svg',
  'Hoodie & sweatshirt': 'measure-tops.svg',
  'Bra': 'measure-bra.svg',
  'Swimwear (women)': 'measure-dresses.svg',
  'Belts': 'measure-belts.svg',
  'Gloves': 'measure-gloves.svg',
  'Hats': 'measure-headwear.svg',
  'Rings': 'measure-circumference.svg',
  'Watches & bracelets': 'measure-circumference.svg',
  'Eyewear (frames)': 'measure-eyewear.svg',
  'Sunglasses': 'measure-eyewear.svg',
  'Kids pants': 'measure-bottoms.svg',
};

const BY_CATEGORY = {
  tops: 'measure-tops.svg',
  bottoms: 'measure-bottoms.svg',
  dresses: 'measure-dresses.svg',
  outerwear: 'measure-outerwear.svg',
  underwear: 'measure-bottoms.svg',
  kids: 'measure-tops.svg',
  footwear: 'measure-footwear.svg',
  eyewear: 'measure-eyewear.svg',
};

export function diagramForPreset(preset) {
  return BY_LABEL[preset.label] ?? BY_CATEGORY[preset.category] ?? '';
}

export function isDiagramFile(value) {
  return MEASURE_DIAGRAMS.some((diagram) => diagram.file === value);
}
