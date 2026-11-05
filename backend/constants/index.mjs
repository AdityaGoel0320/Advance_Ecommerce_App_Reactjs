import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
export const products = require("../../shared/products.json");
export const checkoutCharges = require("../../shared/checkoutCharges.json");

export const categories = [
  { _id: 1001, name: "TV & Audio", _base: "tvAndAudio", image: "/catalog/speaker.jpg", description: "Wireless speakers and home audio for music, movies and everyday listening." },
  { _id: 1002, name: "TV Box", _base: "tvBox", image: "/catalog/tv-box.svg", description: "HDMI streaming boxes and sticks for your television." },
  { _id: 1003, name: "Power Tools", _base: "powerTools", image: "/catalog/tools.jpg", description: "Practical tools for household repairs, drilling and craft projects." },
  { _id: 1004, name: "Headphones", _base: "headphones", image: "/catalog/headphones.jpg", description: "Wireless headphones and earbuds for calls and personal listening." },
  { _id: 1005, name: "Cell Phones", _base: "cellPhones", image: "/catalog/phone.jpg", description: "Everyday smartphones with room for apps, photos and messages." },
  { _id: 1006, name: "Smart Watches", _base: "smartWatches", image: "/catalog/watch.jpg", description: "Connected watches for activity tracking and notifications." },
  { _id: 1007, name: "Game & Video", _base: "gameAndVideo", image: "/catalog/controller.svg", description: "Controllers and accessories for your gaming setup." },
  { _id: 1008, name: "Robot Clean", _base: "robotClean", image: "/catalog/vacuum.jpg", description: "Robot vacuums and mops for routine floor care." },
  { _id: 1009, name: "Sport Watches", _base: "sportWatches", image: "/catalog/watch.jpg", description: "Lightweight wearables for movement and workout tracking." },
  { _id: 1010, name: "Tablets", _base: "tablets", image: "/catalog/writing-tablet.svg", description: "Reusable writing pads for sketches, notes and handwriting practice." },
  { _id: 1011, name: "Computers & Laptop", _base: "computersAndLaptop", image: "/catalog/laptop.jpg", description: "Portable computers for study, documents and everyday work." },
  { _id: 1012, name: "Cameras & Photos", _base: "camerasAndPhotos", image: "/catalog/camera.jpg", description: "Cameras for adventures and indoor home monitoring." },
];

const startingPrice = (base) => Math.min(...products.filter((product) => product._base === base).map((product) => product.discountedPrice));
export const highlightsProducts = [
  { _id: 3001, name: "Sound for every day", startingPrice: startingPrice("headphones"), title: "Wireless listening", buttonTitle: "Explore audio", image: "/catalog/headphones.jpg", _base: "/category/headphones", color: "#ffffff" },
  { _id: 3002, name: "Your next smartphone", startingPrice: startingPrice("cellPhones"), title: "Stay connected", buttonTitle: "Shop phones", image: "/catalog/phone.jpg", _base: "/category/cellPhones", color: "#ffffff" },
  { _id: 3003, name: "Stream on your TV", startingPrice: startingPrice("tvBox"), title: "Make room for entertainment", buttonTitle: "Explore streaming", image: "/catalog/tv-box.svg", _base: "/category/tvBox", color: "#ffffff" },
];

export const blogsData = [
  { _id: 4001, image: "/catalog/laptop.jpg", title: "Build a comfortable everyday workspace", _base: "Technology", description: "Start with a screen at a comfortable height, a clear desk and reliable lighting. Choose a laptop that suits the tasks you actually do each day." },
  { _id: 4002, image: "/catalog/speaker.jpg", title: "Find the right speaker for your room", _base: "Audio", description: "Consider room size and how you listen before choosing a speaker. Placement and listening distance can matter as much as volume." },
  { _id: 4003, image: "/catalog/camera.jpg", title: "Pack smarter for your next adventure", _base: "Photography", description: "Keep your camera protected, charge your batteries and clear storage before leaving. A compact setup leaves more room for enjoying the trip." },
];
