import type { MenuItem } from '../types'

/**
 * Local demo menu used when Firebase keys are missing, so the UI can still be
 * previewed. Images are inline SVG data URIs generated on the fly — once the
 * project is seeded (`npm run seed`), real Firebase Storage images replace them.
 */

const svgImage = (label: string, emoji: string, from: string, to: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="640" height="420" fill="url(#g)"/>
  <circle cx="320" cy="180" r="115" fill="rgba(255,255,255,0.22)"/>
  <text x="320" y="232" font-size="128" text-anchor="middle">${emoji}</text>
  <text x="320" y="356" font-size="34" font-family="Inter, Arial, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface Seed {
  name: string
  description: string
  price: number
  category: string
  isVeg: boolean
  isFeatured?: boolean
  emoji: string
  from: string
  to: string
  rating: number
}

const SEED_ITEMS: Seed[] = [
  {
    name: 'Paneer Tikka',
    description: 'Char-grilled cottage cheese marinated in smoky spices',
    price: 229,
    category: 'starters',
    isVeg: true,
    isFeatured: true,
    emoji: '🧀',
    from: '#f7971e',
    to: '#ffd200',
    rating: 4.6,
  },
  {
    name: 'Chicken Seekh Kebab',
    description: 'Juicy minced chicken kebabs with mint chutney',
    price: 259,
    category: 'starters',
    isVeg: false,
    emoji: '🍢',
    from: '#c33764',
    to: '#1d2671',
    rating: 4.5,
  },
  {
    name: 'Crispy Corn Chaat',
    description: 'Sweet corn tossed with chilli, lime and chaat masala',
    price: 149,
    category: 'starters',
    isVeg: true,
    emoji: '🌽',
    from: '#11998e',
    to: '#38ef7d',
    rating: 4.4,
  },
  {
    name: 'Shahi Paneer',
    description: 'Paneer cubes in a rich, mildly sweet cashew-tomato gravy',
    price: 249,
    category: 'main-course',
    isVeg: true,
    isFeatured: true,
    emoji: '🍛',
    from: '#e23744',
    to: '#ff8a5c',
    rating: 4.7,
  },
  {
    name: 'Butter Chicken',
    description: 'Tandoori chicken simmered in a velvety butter-tomato gravy',
    price: 299,
    category: 'main-course',
    isVeg: false,
    isFeatured: true,
    emoji: '🍗',
    from: '#f12711',
    to: '#f5af19',
    rating: 4.8,
  },
  {
    name: 'Dal Tadka',
    description: 'Yellow lentils tempered with garlic and cumin',
    price: 179,
    category: 'main-course',
    isVeg: true,
    emoji: '🥘',
    from: '#8e2de2',
    to: '#e23744',
    rating: 4.3,
  },
  {
    name: 'Butter Naan',
    description: 'Soft tandoori naan brushed with butter',
    price: 49,
    category: 'breads',
    isVeg: true,
    emoji: '🫓',
    from: '#e6b980',
    to: '#eacda3',
    rating: 4.6,
  },
  {
    name: 'Garlic Cheese Kulcha',
    description: 'Stuffed with garlic, coriander and melted cheese',
    price: 79,
    category: 'breads',
    isVeg: true,
    emoji: '🧄',
    from: '#d1913c',
    to: '#ffd194',
    rating: 4.5,
  },
  {
    name: 'Hyderabadi Chicken Biryani',
    description: 'Long-grain rice layered with spiced chicken and fried onions',
    price: 289,
    category: 'rice-biryani',
    isVeg: false,
    isFeatured: true,
    emoji: '🍚',
    from: '#c94b4b',
    to: '#4b134f',
    rating: 4.8,
  },
  {
    name: 'Veg Dum Biryani',
    description: 'Fragrant rice slow-cooked with seasonal vegetables',
    price: 239,
    category: 'rice-biryani',
    isVeg: true,
    emoji: '🥦',
    from: '#134e5e',
    to: '#71b280',
    rating: 4.4,
  },
  {
    name: 'Chilli Paneer (Dry)',
    description: 'Crispy paneer tossed with peppers and Sichuan sauce',
    price: 219,
    category: 'chinese',
    isVeg: true,
    isFeatured: true,
    emoji: '🥡',
    from: '#de6262',
    to: '#ffb88c',
    rating: 4.5,
  },
  {
    name: 'Chicken Hakka Noodles',
    description: 'Wok-tossed noodles with vegetables and chilli-soy sauce',
    price: 199,
    category: 'chinese',
    isVeg: false,
    emoji: '🍜',
    from: '#eb3349',
    to: '#f45c43',
    rating: 4.4,
  },
  {
    name: 'Grilled Club Sandwich',
    description: 'Triple-decker with cheese, veggies and mint mayo',
    price: 159,
    category: 'snacks',
    isVeg: true,
    emoji: '🥪',
    from: '#654ea3',
    to: '#eaafc8',
    rating: 4.2,
  },
  {
    name: 'Masala Fries',
    description: 'Crispy fries dusted with house masala',
    price: 99,
    category: 'snacks',
    isVeg: true,
    emoji: '🍟',
    from: '#f2994a',
    to: '#f2c94c',
    rating: 4.3,
  },
  {
    name: 'Cold Coffee',
    description: 'Blended coffee with milk and a scoop of ice cream',
    price: 129,
    category: 'beverages',
    isVeg: true,
    isFeatured: true,
    emoji: '☕',
    from: '#6f4e37',
    to: '#c8a27d',
    rating: 4.7,
  },
  {
    name: 'Mango Smoothie',
    description: 'Fresh alphonso mango blended with curd and honey',
    price: 119,
    category: 'beverages',
    isVeg: true,
    emoji: '🥭',
    from: '#fdc830',
    to: '#f37335',
    rating: 4.5,
  },
  {
    name: 'Gulab Jamun (2 pc)',
    description: 'Warm khoya dumplings soaked in cardamom syrup',
    price: 89,
    category: 'desserts',
    isVeg: true,
    emoji: '🍮',
    from: '#b79891',
    to: '#94716b',
    rating: 4.6,
  },
  {
    name: 'Chocolate Brownie Sundae',
    description: 'Fudgy brownie, vanilla ice cream, hot chocolate sauce',
    price: 179,
    category: 'desserts',
    isVeg: true,
    isFeatured: true,
    emoji: '🍨',
    from: '#3a1c71',
    to: '#d76d77',
    rating: 4.8,
  },
]

let cached: MenuItem[] | null = null

/** Returns the in-memory demo menu (stable ids so the cart works). */
export function getDemoMenuItems(): MenuItem[] {
  if (cached) return cached
  cached = SEED_ITEMS.map((seed, index) => ({
    id: `demo-${index + 1}`,
    name: seed.name,
    description: seed.description,
    price: seed.price,
    category: seed.category,
    isVeg: seed.isVeg,
    isAvailable: true,
    isFeatured: Boolean(seed.isFeatured),
    imageUrl: svgImage(seed.name, seed.emoji, seed.from, seed.to),
    imagePath: '',
    rating: seed.rating,
    prepTimeMins: 20 + (index % 4) * 5,
    createdAt: null,
  }))
  return cached
}
