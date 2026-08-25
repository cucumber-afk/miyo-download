export const heroAnimationSlots = [
  {
    slotId: 'gray',
    name: 'gray-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/gray.gif',
    left: 10.9,
    top: 53.0,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
  {
    slotId: 'black',
    name: 'black-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/black.gif',
    left: 26.4,
    top: 53.0,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
  {
    slotId: 'blue',
    name: 'blue-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/blue.gif',
    left: 42.0,
    top: 53.0,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
  {
    slotId: 'green',
    name: 'green-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/green.gif',
    left: 57.7,
    top: 53.0,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
  {
    slotId: 'yellow',
    name: 'yellow-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/yellow.gif',
    left: 73.3,
    top: 53.0,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
  {
    slotId: 'pink',
    name: 'pink-miyo',
    enabled: true,
    type: 'gif',
    fallbackSrc: '/assets/animations/hero/pink.gif',
    left: 89.1,
    top: 53.7,
    width: 8.4,
    aspectRatio: '1 / 1',
    contentScale: 1,
  },
];

export const DEFAULT_ANIMATION_SLOTS = heroAnimationSlots.map(({ slotId, fallbackSrc, left, top, width, contentScale, aspectRatio }) => ({
  slotId,
  name: `${slotId}-miyo`,
  enabled: true,
  type: 'gif',
  mediaKey: '',
  fallbackSrc,
  left,
  top,
  width,
  aspectRatio,
  contentScale,
}));

export const SLOT_IDS = ['gray', 'black', 'blue', 'green', 'yellow', 'pink'];

export function getDefaultSlot(slotId) {
  return DEFAULT_ANIMATION_SLOTS.find((s) => s.slotId === slotId) || null;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
