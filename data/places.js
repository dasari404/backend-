const places = [
  { id: 1,  name: 'Taj Mahal',              lat: 27.1751, lng: 78.0421, type: 'open',   crowd: 'Medium', safety: 9,    bestTime: 'Sunrise (6–8 AM)',      desc: 'Iconic white marble mausoleum, UNESCO World Heritage Site.' },
  { id: 2,  name: 'Jaipur City Palace',      lat: 26.9257, lng: 75.8235, type: 'busy',   crowd: 'High',   safety: 8,    bestTime: 'Morning (9–11 AM)',      desc: 'Royal palace complex in the heart of the Pink City.' },
  { id: 3,  name: 'Varanasi Ghats',          lat: 25.3176, lng: 82.9739, type: 'busy',   crowd: 'High',   safety: 7,    bestTime: 'Dawn Aarti (5–6 AM)',    desc: 'Ancient city on the Ganges with iconic stepped riverbanks.' },
  { id: 4,  name: 'Kerala Backwaters',       lat: 9.4981,  lng: 76.3388, type: 'open',   crowd: 'Low',    safety: 9,    bestTime: 'Morning (8–10 AM)',      desc: 'Tranquil network of canals, lagoons, and lakes in coastal Kerala.' },
  { id: 5,  name: 'Hampi Ruins',             lat: 15.3350, lng: 76.4600, type: 'open',   crowd: 'Low',    safety: 8,    bestTime: 'Sunrise / Sunset',       desc: 'Stunning ruins of the Vijayanagara Empire set among boulders.' },
  { id: 6,  name: 'Rann of Kutch',           lat: 23.7337, lng: 69.8597, type: 'open',   crowd: 'Low',    safety: 9,    bestTime: 'Oct–Feb (Rann Utsav)',   desc: 'Vast white salt desert, magical at full moon.' },
  { id: 7,  name: 'Khajuraho Temples',       lat: 24.8318, lng: 79.9199, type: 'open',   crowd: 'Low',    safety: 9,    bestTime: 'Morning (7–11 AM)',      desc: 'Famous medieval temples with intricate sculpture art.' },
  { id: 8,  name: 'Ajanta Caves',            lat: 20.5519, lng: 75.7033, type: 'closed', crowd: 'N/A',    safety: null, bestTime: 'Currently Closed',       desc: 'Ancient Buddhist cave monuments currently under renovation.' },
  { id: 9,  name: 'Leh Palace, Ladakh',      lat: 34.1642, lng: 77.5847, type: 'open',   crowd: 'Low',    safety: 8,    bestTime: 'Morning (9 AM–1 PM)',    desc: 'Nine-storey palace above Leh with panoramic Himalayan views.' },
  { id: 10, name: 'Sundarbans',              lat: 21.9497, lng: 88.8796, type: 'open',   crowd: 'Medium', safety: 7,    bestTime: 'Oct–Mar',                desc: "World's largest mangrove forest, home to the Royal Bengal Tiger." },
  { id: 11, name: 'Coorg Coffee Estates',    lat: 12.3375, lng: 75.8069, type: 'gem',    crowd: 'Low',    safety: 9,    bestTime: 'Year-round',             desc: 'Lush coffee and spice plantations in the misty Western Ghats.' },
  { id: 12, name: 'Ziro Valley, Arunachal', lat: 27.5330, lng: 93.8278, type: 'gem',    crowd: 'Low',    safety: 9,    bestTime: 'Sep–Oct',                desc: 'Serene valley of the Apatani tribe with unique paddy-fish farming.' },
  { id: 13, name: 'Mawlynnong Village',      lat: 25.2020, lng: 91.9120, type: 'gem',    crowd: 'Low',    safety: 10,   bestTime: 'Year-round',             desc: "Asia's Cleanest Village with living root bridges." },
  { id: 14, name: 'Spiti Valley',            lat: 32.2461, lng: 78.0338, type: 'open',   crowd: 'Low',    safety: 8,    bestTime: 'May–Oct',                desc: 'Cold desert mountain valley with ancient monasteries in Himachal.' },
  { id: 15, name: 'Gokarna Beach',           lat: 14.5479, lng: 74.3188, type: 'open',   crowd: 'Medium', safety: 8,    bestTime: 'Oct–Mar',                desc: 'Pristine beaches and the sacred Mahabaleshwara temple.' },
  { id: 16, name: 'Majuli Island',           lat: 26.9503, lng: 94.1793, type: 'gem',    crowd: 'Low',    safety: 9,    bestTime: 'Oct–Apr',                desc: "World's largest river island on Brahmaputra with rare birds." },
  { id: 17, name: 'Chopta, Uttarakhand',     lat: 30.5133, lng: 79.3085, type: 'gem',    crowd: 'Low',    safety: 9,    bestTime: 'Mar–Jun / Sep–Nov',      desc: '"Mini Switzerland of India" — meadows and views of Trishul peak.' },
];

module.exports = places;
