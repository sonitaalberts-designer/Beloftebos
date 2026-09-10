import { photos, type Entry } from "./content";
export const gallerySeeds: Entry[] = [
  {
    id: "hero",
    image: photos.hero,
    title: "A farmhouse welcome",
    category: "Property",
    alt: "Stone farmhouse with a red roof and green lawn at BelofteBos",
  },
  {
    id: "garden",
    image: photos.garden,
    title: "Under the trees",
    category: "Garden",
    alt: "Mature trees and picnic tables in the BelofteBos garden",
  },
  {
    id: "room",
    image: photos.room,
    title: "HeuningBos",
    category: "Rooms",
    alt: "Wooden bed with turquoise cushions and a draped canopy in HeuningBos",
  },
  {
    id: "pool",
    image: photos.pool,
    title: "Afternoons by the pool",
    category: "Pool",
    alt: "Outdoor pool and loungers at BelofteBos",
  },
  {
    id: "food",
    image: photos.food,
    title: "Around the table",
    category: "Food",
    alt: "Fruit platter and flowers photographed at BelofteBos",
  },
  {
    id: "terrace",
    image: photos.nature,
    title: "A quiet corner",
    category: "Farmhouse",
    alt: "Stone steps leading to the BelofteBos farmhouse terrace",
  },
].map((e) => ({ ...e, published: true }));
