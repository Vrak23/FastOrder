/**
 * Catálogo de Productos y Menú Oficial - FastOrder S.A.
 */

export const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'fa-layer-group' },
  { id: 'combos', name: 'Combos', icon: 'fa-cubes' },
  { id: 'burgers', name: 'Hamburguesas', icon: 'fa-burger' },
  { id: 'chicken', name: 'Acompañamientos', icon: 'fa-bowl-food' },
  { id: 'sides', name: 'Guarniciones', icon: 'fa-utensils' },
  { id: 'drinks', name: 'Bebidas', icon: 'fa-glass-water' },
  { id: 'desserts', name: 'Postres', icon: 'fa-ice-cream' }
];

export const MENU_PRODUCTS = [
  {
    id: 'prod-01',
    name: 'Combo FastOrder Supremo',
    category: 'combos',
    price: 32.50,
    description: 'Doble carne, cheddar fundido, tocino, papas y bebida.',
    badge: 'MÁS PEDIDO',
    calories: '1150 kcal',
    prepTime: '10 MIN',
    image: 'img/p1.png',
    options: {
      terminos: ['Término medio', '3/4', 'Bien cocido'],
      salsas: ['Mayonesa Tradicional', 'Ají Especial FastOrder', 'Kétchup Clásico', 'Golf Ahumada'],
      extras: [
        { name: 'Queso Cheddar Fundido', price: 3.50 },
        { name: 'Tocino Crocante Extra', price: 4.00 },
        { name: 'Huevo a la Plancha', price: 2.50 }
      ]
    }
  },
  {
    id: 'prod-02',
    name: 'Burger Monster Bacon Deluxe',
    category: 'burgers',
    price: 24.90,
    description: 'Carne artesanal (180g), queso suizo, cebolla caramelizada, triple tocino y salsa BBQ.',
    badge: 'FAVORITO',
    calories: '890 kcal',
    prepTime: '8 MIN',
    image: 'img/p2.png',
    options: {
      terminos: ['Término medio', '3/4', 'Bien cocido'],
      salsas: ['BBQ Ahumada', 'Ají Especial FastOrder', 'Mayonesa Tradicional'],
      extras: [
        { name: 'Doble Carne Extra (90g)', price: 6.00 },
        { name: 'Queso Cheddar Extra', price: 3.50 }
      ]
    }
  },
  {
    id: 'prod-03',
    name: 'Burger Clásica Royal Criolla',
    category: 'burgers',
    price: 21.00,
    description: 'Carne a la parrilla, jamón artesanal, huevo frito, lechuga y tomate.',
    badge: 'CLÁSICO',
    calories: '760 kcal',
    prepTime: '7 MIN',
    image: 'img/p3.png',
    options: {
      terminos: ['Término medio', '3/4', 'Bien cocido'],
      salsas: ['Mayonesa Tradicional', 'Tártara de la Casa', 'Ají Pollero'],
      extras: [
        { name: 'Plátano Frito (2 rodajas)', price: 2.00 },
        { name: 'Queso Edam Fundido', price: 3.00 }
      ]
    }
  },
  {
    id: 'prod-04',
    name: 'Combo Duo Mega Broaster',
    category: 'combos',
    price: 38.00,
    description: '4 piezas de pollo broaster crujiente, porción grande de papas y 2 bebidas.',
    badge: 'MÁS PEDIDO',
    calories: '1420 kcal',
    prepTime: '12 MIN',
    image: 'img/p4.png',
    options: {
      salsas: ['Ají Pollero Picante', 'Mayonesa Casera', 'Kétchup Clásico'],
      extras: [
        { name: 'Pieza de Pollo Adicional', price: 6.50 },
        { name: 'Porción Extra Papas', price: 4.50 }
      ]
    }
  },
  {
    id: 'prod-05',
    name: 'Crispy Chicken Strips & Dips',
    category: 'chicken',
    price: 18.50,
    description: '6 tiras de pechuga de pollo rebozado ultra crujiente con salsas.',
    badge: 'CRISPY',
    calories: '610 kcal',
    prepTime: '8 MIN',
    image: 'img/p5.png',
    options: {
      salsas: ['Honey Mustard', 'BBQ Ahumada', 'Mayonesa Tradicional'],
      extras: [
        { name: '3 Strips Adicionales', price: 7.00 },
        { name: 'Papas Fritas Medianas', price: 5.00 }
      ]
    }
  },
  {
    id: 'prod-06',
    name: 'Papas Rústicas Cheddar & Tocino',
    category: 'sides',
    price: 14.00,
    description: 'Papas nativas fritas bañadas en queso cheddar caliente y lluvia de bacon.',
    badge: 'FAVORITO',
    calories: '550 kcal',
    prepTime: '6 MIN',
    image: 'img/p6.png',
    options: {
      salsas: ['Cheddar Caliente', 'Crema Tártara', 'Ají FastOrder'],
      extras: [
        { name: 'Doble Tocino', price: 3.50 }
      ]
    }
  },
  {
    id: 'prod-07',
    name: 'Aros de Cebolla Rebozados (8 pcs)',
    category: 'sides',
    price: 12.00,
    description: 'Aros de cebolla dulce al panko especiado con salsa tártara de la casa.',
    badge: 'CLÁSICO',
    calories: '380 kcal',
    prepTime: '5 MIN',
    image: 'img/p7.png',
    options: {
      salsas: ['Tártara Casera', 'BBQ', 'Mayonesa Tradicional'],
      extras: [
        { name: 'Salsa Extra BBQ', price: 2.00 }
      ]
    }
  },
  {
    id: 'prod-08',
    name: 'Chicha Morada Tradicional (1 Litro)',
    category: 'drinks',
    price: 9.50,
    description: 'Elaborada artesanalmente con maíz morado, piña, canela y toque de limón.',
    badge: 'NATURAL',
    calories: '180 kcal',
    prepTime: '2 MIN',
    image: 'img/p8.png',
    options: {
      extras: [
        { name: 'Hielo Extra', price: 0.00 }
      ]
    }
  },
  {
    id: 'prod-09',
    name: 'Sundae Dulce de Leche & Brownie',
    category: 'desserts',
    price: 10.90,
    description: 'Helado cremoso de vainilla con trozos de brownie tibio y manjar blanco.',
    badge: 'DELICIA',
    calories: '420 kcal',
    prepTime: '3 MIN',
    image: 'img/p9.png',
    options: {
      extras: [
        { name: 'Porción Extra Brownie', price: 3.50 }
      ]
    }
  }
];
