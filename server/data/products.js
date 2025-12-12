const products = [
  // ==== FIGURES ====
  { id: 101, name: "Naruto Uzumaki Figure", category: "Figure", fandom: "Naruto", price: 44.99, stock: 12, status: "Active" },
  { id: 102, name: "Sasuke Uchiha Figure", category: "Figure", fandom: "Naruto", price: 49.99, stock: 3, status: "Active" }, // low
  { id: 103, name: "Gojo Satoru Figure", category: "Figure", fandom: "Jujutsu Kaisen", price: 59.99, stock: 0, status: "OutOfStock" }, // out
  { id: 104, name: "Luffy Gear 5 Figure", category: "Figure", fandom: "One Piece", price: 74.99, stock: 6, status: "Active" },

  // ==== MANGA ====
  { id: 105, name: "Berserk Manga Vol. 1", category: "Manga", fandom: "Berserk", price: 14.99, stock: 2, status: "Active" }, // low
  { id: 106, name: "One Piece Manga Vol. 99", category: "Manga", fandom: "One Piece", price: 12.99, stock: 18, status: "Active" },
  { id: 107, name: "Attack on Titan Vol. 34", category: "Manga", fandom: "Attack on Titan", price: 11.99, stock: 0, status: "OutOfStock" }, // out
  { id: 108, name: "Demon Slayer Box Set", category: "Manga", fandom: "Demon Slayer", price: 129.99, stock: 4, status: "Active" }, // low

  // ==== POSTERS ====
  { id: 109, name: "Elden Ring Poster (A2)", category: "Poster", fandom: "Gaming", price: 12.5, stock: 25, status: "Active" },
  { id: 110, name: "Cyberpunk 2077 Poster (A2)", category: "Poster", fandom: "Gaming", price: 13.0, stock: 1, status: "Active" }, // low
  { id: 111, name: "Studio Ghibli Collage Poster", category: "Poster", fandom: "Ghibli", price: 15.99, stock: 9, status: "Active" },

  // ==== ACCESSORIES ====
  { id: 112, name: "Akatsuki Keychain Set", category: "Accessory", fandom: "Naruto", price: 9.99, stock: 0, status: "OutOfStock" }, // out
  { id: 113, name: "Zoro Katana Keychain", category: "Accessory", fandom: "One Piece", price: 7.99, stock: 14, status: "Active" },
  { id: 114, name: "Poké Ball Desk Lamp", category: "Accessory", fandom: "Pokemon", price: 24.99, stock: 4, status: "Active" }, // low

  // ==== CLOTHING ====
  { id: 115, name: "Akatsuki Cloak Hoodie", category: "Clothing", fandom: "Naruto", price: 54.99, stock: 8, status: "Active" },
  { id: 116, name: "Survey Corps Jacket", category: "Clothing", fandom: "Attack on Titan", price: 64.99, stock: 0, status: "OutOfStock" }, // out

  // ==== COLLECTIBLES ====
  { id: 117, name: "PS5 DualSense Skin (Anime)", category: "Collectible", fandom: "Gaming", price: 19.99, stock: 16, status: "Active" },
  { id: 118, name: "Dragon Ball Capsule Set", category: "Collectible", fandom: "Dragon Ball", price: 29.99, stock: 3, status: "Active" }, // low
];
module.exports = products;
