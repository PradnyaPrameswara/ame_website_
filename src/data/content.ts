import kineticPortrait from "../assets/images/kinetic-portrait.png";
import shapeStudio from "../assets/images/shape-studio.png";
import mirrorInstallation from "../assets/images/mirror-installation.png";
import materialStudy from "../assets/images/material-study.png";
import filmSet from "../assets/images/film-set.png";
import silverField from "../assets/images/silver-field.png";

export const navigation = [
  { label: "Work,", href: "#work" },
  { label: "Services,", href: "#services" },
  { label: "About,", href: "#about" },
  { label: "Create with us", href: "#contact" },
] as const;

export const chapters = [
  { number: "01", label: "Our Beginning", target: "beginning" },
  { number: "02", label: "Our Trust", target: "trust" },
  { number: "03", label: "Our Capabilities", target: "capabilities" },
] as const;

export const gallery = [
  { image: kineticPortrait, alt: "Dancer in red fabric moving through a cobalt architectural set", speed: -15, className: "gallery-card--a" },
  { image: shapeStudio, alt: "Art director arranging large red geometric props in a daylight studio", speed: 10, className: "gallery-card--b" },
  { image: mirrorInstallation, alt: "Mirrored art installation glowing red in a concrete plaza", speed: -9, className: "gallery-card--c" },
  { image: materialStudy, alt: "Red pigment, chrome spheres, acrylic and paper arranged as a material study", speed: 14, className: "gallery-card--d" },
  { image: filmSet, alt: "Cinematographer filming inside a red and blue studio set", speed: -12, className: "gallery-card--e" },
  { image: silverField, alt: "Model in a silver sculptural dress among translucent panels", speed: 8, className: "gallery-card--f" },
] as const;

export const heroTrail = [
  gallery[0], gallery[2], gallery[4], gallery[1],
  gallery[5], gallery[3], gallery[0], gallery[2],
] as const;

export const clients = [
  { name: "Gilead", image: kineticPortrait, description: "A global story system designed to make complex science feel immediate, human, and ready to move." },
  { name: "Hulu", image: mirrorInstallation, description: "A sharp campaign world connecting entertainment, cultural momentum, and audience participation." },
  { name: "Warner", image: silverField, description: "A cinematic visual language shaped to carry one story across screens, spaces, and live moments." },
  { name: "Spotify", image: shapeStudio, description: "An editorial content system built around artists, discovery, and the energy of a shared listen." },
  { name: "Sony", image: materialStudy, description: "A product narrative where material, movement, and sound became a cohesive launch experience." },
  { name: "Coachella", image: filmSet, description: "A flexible production platform translating the scale and intimacy of a cultural gathering." },
  { name: "Art Basel", image: kineticPortrait, description: "A visual story balancing artists, architecture, and the rhythm of an international audience." },
  { name: "Fendi", image: materialStudy, description: "A tactile campaign language bringing craft, fashion, and contemporary culture into one frame." },
  { name: "Meta", image: silverField, description: "A modular creative system designed for clarity, speed, and meaningful human connection." },
  { name: "Google", image: mirrorInstallation, description: "An experiential narrative that turned technology into a useful, accessible part of everyday life." },
] as const;

export const services = [
  { number: "01", title: "Brand & Creative", description: "We find your truth. Then define your brand identity and creative structure.", tags: ["Strategy", "Narrative", "Direction"], tone: "blue" },
  { number: "02", title: "Campaign & Film", description: "We tell stories that connect emotionally and perform commercially.", tags: ["Concept", "Production", "Storytelling"], tone: "blue" },
  { number: "03", title: "Visual & Experiential", description: "We turn spaces into experiences you can feel.", tags: ["Design", "Environments", "Merchandising"], tone: "blue" },
  { number: "04", title: "Growth & Partnership", description: "We connect creativity with operations so ideas ship and don’t die in a deck.", tags: ["PR", "Process", "Procurement"], tone: "blue" },
] as const;

export const footerLinks = navigation.slice(0, 3);

export const operations = ["Numbers", "Vendors", "Business Plans", "Scopes"] as const;

export const capabilities = ["Film", "Logic", "Emotion"] as const;
