import kineticPortrait from "../assets/images/kinetic-portrait.png";
import shapeStudio from "../assets/images/shape-studio.png";
import mirrorInstallation from "../assets/images/mirror-installation.png";
import materialStudy from "../assets/images/material-study.png";
import filmSet from "../assets/images/film-set.png";
import silverField from "../assets/images/silver-field.png";

type NavigationItem = { label: string; href: `#${string}` };
type GalleryItem = { image: ImageMetadata; alt: string };
type Client = { name: string; image: ImageMetadata; description: string };
type Service = { number: string; title: string; description: string; tags: string[]; tone: "blue" };

export const navigation = [
  { label: "Work,", href: "#work" },
  { label: "Services,", href: "#services" },
  { label: "About,", href: "#about" },
  { label: "Create with us", href: "#contact" },
] as const satisfies readonly NavigationItem[];

export const gallery = [
  { image: kineticPortrait, alt: "Editorial detail from an AME craft collection" },
  { image: shapeStudio, alt: "Sculptural form study from AME furniture workshop" },
  { image: mirrorInstallation, alt: "Reflective material study for a handcrafted interior" },
  { image: materialStudy, alt: "Materials and pigments arranged for an AME craft collection" },
  { image: filmSet, alt: "Behind the scenes at an AME furniture collection shoot" },
  { image: silverField, alt: "Textile and sculptural surface study" },
] as const satisfies readonly GalleryItem[];

export const heroTrail = [
  gallery[0], gallery[2], gallery[4], gallery[1],
  gallery[5], gallery[3], gallery[0], gallery[2],
] as const satisfies readonly GalleryItem[];

export const clients = [
  { name: "Oak Series", image: kineticPortrait, description: "A family of solid-wood pieces built around generous curves and everyday use." },
  { name: "Atelier Chair", image: mirrorInstallation, description: "A sculptural lounge chair where proportion, joinery, and comfort meet." },
  { name: "Clay Objects", image: silverField, description: "Small-batch vessels with tactile glazes and deliberately irregular silhouettes." },
  { name: "Linen Room", image: shapeStudio, description: "Layered textiles and soft furnishings made for slow, lived-in interiors." },
  { name: "Brass Study", image: materialStudy, description: "Hand-finished hardware and lighting developed to age with character." },
  { name: "Workshop Table", image: filmSet, description: "A communal table designed for making, gathering, and daily rituals." },
] as const satisfies readonly Client[];

export const services = [
  { number: "01", title: "Furniture", description: "Considered pieces with enduring forms, built for the rhythms of everyday life.", tags: ["Tables", "Seating", "Storage"], tone: "blue" },
  { number: "02", title: "Objects", description: "Small-batch vessels, lighting, and details shaped by hand and material.", tags: ["Ceramics", "Lighting", "Hardware"], tone: "blue" },
  { number: "03", title: "Interiors", description: "Warm, tactile rooms where every finish earns its place.", tags: ["Materials", "Styling", "Installation"], tone: "blue" },
  { number: "04", title: "Custom Work", description: "Collaborative commissions for spaces that need something made specifically for them.", tags: ["Commissions", "Prototypes", "Craft"], tone: "blue" },
] as const satisfies readonly Service[];

export const footerLinks = navigation.slice(0, 3);

export const operations = ["Timber", "Textiles", "Ceramics", "Joinery"] as const;

export const capabilities = ["Form", "Material", "Living"] as const;
