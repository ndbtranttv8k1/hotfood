// FOOD MODAL //
export const foodData = { 
    Burrito: {
        title: "BURRITO",
        intro: "Món ăn Mexico gồm bánh tortilla cuộn nhân như thịt, đậu, cơm và rau, tiện lợi và đậm đà hương vị.",
        ingredients: ["Bột mì", "Thịt bò", "Sốt cà chua", "Phô mai", "Xà lách"],
        clip: "<p>Xem video tại đây: <br><a href='https://www.youtube.com/watch?v=fxs1_aljKn8' target='_blank'>[Nhấn vào để xem video]</a></p>"
    },
    Empadana: {
        title: "EMPANADA",
        intro: "Bánh nướng hoặc chiên có vỏ bột giòn, bên trong nhân mặn như thịt, phô mai hoặc rau, phổ biến ở các nước Mỹ Latinh.",
        ingredients: ["Bột mì", "Thịt bò", "Tỏi", "Hành tây", "Trứng"],
        clip: "<p>Xem video tại đây: <br><a href='https://www.youtube.com/watch?v=HHsmRoHE7K0' target='_blank'>[Nhấn vào để xem video]</a></p>"
    },
    Padthai: {
        title: "PADTHAI",
        intro: "Món mì xào nổi tiếng của Thái Lan, kết hợp vị chua, ngọt, mặn hài hòa với tôm, trứng, đậu phụ và lạc rang.",
        ingredients: ["Mì", "Tôm", "Trứng", "Hành lá", "Đậu phộng"],
        clip: "<p>Xem video tại đây: <br><a href='https://www.youtube.com/watch?v=BzyI8DZ9DaU' target='_blank'>[Nhấn vào để xem video]</a></p>"
    },
    Spaghetti: {
        title: "SPAGHETTI",
        intro: "Sợi mì Ý vàng óng, dai mềm kết hợp cùng sốt cà chua thịt bò băm đậm đà chuẩn vị.",
        ingredients: ["Mì", "Thịt bò", "Sốt cà chua", "Tỏi", "Phô mai"],
        clip: "<p>Xem video tại đây: <br><a href='https://www.youtube.com/watch?v=dKtHsNNp9yk' target='_blank'>[Nhấn vào để xem video]</a></p>"
    },
    Takoyaki: {
        title: "TAKOYAKI",
        intro: "Bánh bột viên của Nhật Bản, bên trong có bạch tuộc, mềm bên trong và giòn nhẹ bên ngoài, thường ăn kèm sốt đậm đà.",
        ingredients: ["Bột mì", "Bạch tuộc", "Hành tây", "Trứng", "Hành lá"],
        clip: "<p>Xem video tại đây: <br><a href='https://www.youtube.com/watch?v=-d8nTfzxES8' target='_blank'>[Nhấn vào để xem video]</a></p>"
    },
};
// RECIPE //
export const recipeData = { 
    Burrito: ["Bột mì", "Thịt bò", "Sốt cà chua", "Phô mai", "Xà lách"],
    Empadana: ["Bột mì", "Thịt bò", "Tỏi", "Hành tây", "Trứng"],
    Padthai: ["Mì", "Tôm", "Trứng", "Hành lá", "Đậu phộng"],
    Spaghetti: ["Mì", "Thịt bò", "Sốt cà chua", "Tỏi", "Phô mai"],
    Takoyaki: ["Bột mì", "Bạch tuộc", "Hành tây", "Trứng", "Hành lá"],

    secret1: ["Bột mì", "Trứng", "Sốt cà chua", "Thịt bò", "Xà lách"],          
    secret2: ["Mì", "Thịt bò", "Hành lá", "Hành tây", "Tỏi"],           
    secret3: ["Dawg"]
};
// INGREDIENT //
export const ingredientImages = { 
    "Bột mì": "/cook/flour.png",
    "Phô mai": "/cook/cheese.png",
    "Xà lách": "/cook/lettuce.png",
    "Mì":"/cook/packet.png",
    "Thịt bò": "/cook/beef.png",
    "Sốt cà chua": "/cook/tomato.png",
    "Tỏi":"/cook/garlic.png",
    "Hành tây": "/cook/onion.png",
    "Trứng": "/cook/egg.png",
    "Bạch tuộc": "/cook/octopus.png",
    "Hành lá":"/cook/spring.png",
    "Tôm": "/cook/shrimp.png",
    "Đậu phộng":"/cook/peanut.png",
    "Dawg":"/cook/dog1.png"
};
export const allIngredients = ["Bột mì", "Phô mai", "Xà lách", "Mì", "Thịt bò", "Sốt cà chua", "Tỏi", "Hành tây", "Trứng", "Bạch tuộc", "Hành lá", "Tôm", "Đậu phộng", "Dawg"];
// FOOD 3D MODEL //
export const foodModels = { 
    Burrito: '/food/burrito.glb',
    Empadana: '/food/empanada.glb',
    Padthai: '/food/padthai.glb',
    Spaghetti: '/food/spag.glb',
    Takoyaki: '/food/tako.glb'
};
// COUNTRY LOCATION //
export const buttonData = [ 
    { key: 'Spaghetti', lat: 36, lon: 12, img: '/food/block.jpg', model: '/food/spag.glb', bg: '/UI/ItalyTemp.png' },
    { key: 'Empadana', lat: -38, lon: -65, img: '/food/block.jpg', model: '/food/empanada.glb', bg: '/UI/ArgentinaTemp.png' },
    { key: 'Burrito', lat: 19, lon: -104, img: '/food/block.jpg', model: '/food/burrito.glb', bg: '/UI/MexicoTemp.png' },
    { key: 'Padthai', lat: 8, lon: 100, img: '/food/block.jpg', model: '/food/padthai.glb', bg: '/UI/ThaiTemp.png' },
    { key: 'Takoyaki', lat: 34, lon: 140, img: '/food/block.jpg', model: '/food/tako.glb', bg: '/UI/JapanTemp.png' },
];
// Trạng thái game
export const gameState = {
  Burrito: false, Empadana: false, Padthai: false, Spaghetti: false, Takoyaki: false
};
export const penaltyGifs = [
    "/UI/ha1.gif",
    "/UI/ha2.gif",
    "/UI/ha3.gif",
    "/UI/ha4.gif",
];
