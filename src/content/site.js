// Single source of truth for site copy and media. Everything here comes from the
// existing site copy or from the supplied assets (titles are taken from the key art).
import gravityWide from '../assets/media/gravity-rush-wide.webp'
import gravitySquare from '../assets/media/gravity-rush-square.webp'
import gravityClip from '../assets/media/gravity-rush.mp4'
import luckyWide from '../assets/media/lucky-pit-wide.webp'
import luckySquare from '../assets/media/lucky-pit-square.webp'
import luckyClip from '../assets/media/lucky-pit.mp4'
import pendakianWide from '../assets/media/pendakian-terakhir-wide.webp'
import pendakianSquare from '../assets/media/pendakian-terakhir-square.webp'
import pendakianClip from '../assets/media/pendakian-terakhir.mp4'
import textileWide from '../assets/media/textile-tycoon-wide.webp'
import textileSquare from '../assets/media/textile-tycoon-square.webp'
import textileClip from '../assets/media/textile-tycoon.mp4'
import modelingClip from '../assets/media/process-modeling.mp4'
import codingClip from '../assets/media/process-coding.mp4'
import animatingClip from '../assets/media/process-animating.mp4'

/**
 * The six story chapters. Their initials are exactly the six glyphs the
 * Stamp RSPK face ships with (A C D F L S), so each chapter gets a stamp.
 */
export const CHAPTERS = [
  { id: 'arrive', stamp: 'A', name: 'Arrive' },
  {
    id: 'scatter',
    stamp: 'S',
    name: 'Scatter',
    title: 'Experimentation',
    body: 'We try the strange version first. Ideas start as rough prototypes and earn their polish.',
  },
  {
    id: 'construct',
    stamp: 'C',
    name: 'Construct',
    title: 'Thoughtful design',
    body: 'Every world and wearable is built with intent, from the first sketch to the final detail.',
  },
  {
    id: 'detail',
    stamp: 'D',
    name: 'Detail',
    title: 'How a world gets made',
    body: 'Modeled, scripted, animated. Real footage from our desks, one pin at a time.',
  },
  {
    id: 'form',
    stamp: 'F',
    name: 'Form',
    title: 'Passion for play',
    body: 'We make what we want to play ourselves, then test it with players until it clicks.',
  },
  {
    id: 'leap',
    stamp: 'L',
    name: 'Leap',
    title: 'Now step inside',
    body: 'From interactive worlds to wearable designs. Here are the ones you can play.',
  },
]

/** Hotspots on the island (chapter D). `anchor` is a point in island space. */
export const PROCESS = [
  {
    id: 'model',
    label: 'Model',
    title: 'Modeling',
    body: 'Every asset starts as a block in Blender and gets pushed, cut and shaped until it reads at a glance.',
    clip: modelingClip,
    anchor: [-1.6, 1.25, -1.4],
  },
  {
    id: 'script',
    label: 'Script',
    title: 'Scripting',
    body: 'Mechanics live in Roblox Studio: config tables, tuning values and the code that makes a world react.',
    clip: codingClip,
    anchor: [2.05, 0.55, 1.6],
  },
  {
    id: 'animate',
    label: 'Animate',
    title: 'Animation',
    body: 'Characters get rigged and posed keyframe by keyframe so every swing and step has weight.',
    clip: animatingClip,
    anchor: [1.4, 1.7, -2.1],
  },
]

export const GAMES = [
  {
    id: 'gravity-rush',
    title: 'Gravity Rush',
    subtitle: 'Carry more, grow bigger',
    alt: 'Boulder Run',
    genre: 'Simulator',
    body: 'Haul boulders across floating islands. The more you carry, the bigger you grow.',
    wide: gravityWide,
    square: gravitySquare,
    clip: gravityClip,
    art: 'Gravity Rush key art: a Roblox avatar in sunglasses hauling a giant boulder across floating islands',
  },
  {
    id: 'lucky-pit',
    title: 'Lucky Pit',
    subtitle: 'Dungeon of Shadows',
    alt: 'Dungeon Boss Battle',
    genre: 'Dungeon',
    body: 'Drop into a dungeon of shadows, gear up by the campfire and fight your way to the boss.',
    wide: luckyWide,
    square: luckySquare,
    clip: luckyClip,
    art: 'Lucky Pit key art: adventurers facing a giant stone boss in a torch-lit purple dungeon',
  },
  {
    id: 'pendakian-terakhir',
    title: 'Pendakian Terakhir',
    subtitle: 'Moonlit Mountain Ghost',
    alt: 'Moonlit Village: The Final Ascent',
    genre: 'Horror',
    body: 'A moonlit climb through an abandoned mountain village. Something is waiting at the top.',
    wide: pendakianWide,
    square: pendakianSquare,
    clip: pendakianClip,
    art: 'Pendakian Terakhir key art: a long-haired ghost under a full moon in front of a misty mountain village',
  },
  {
    id: 'textile-tycoon',
    title: 'Textile Tycoon',
    subtitle: 'Pabrik Tekstil Ceria',
    alt: 'Taipan Tekstil Ceria',
    genre: 'Tycoon',
    body: 'Run a cheerful textile factory, from the first spool of thread to a busy shop floor. Upgrade and expand.',
    wide: textileWide,
    square: textileSquare,
    clip: textileClip,
    art: 'Textile Tycoon key art: a smiling avatar holding a blue shirt beside a factory conveyor and clothing shop',
  },
]

export const CHANNELS = [
  { label: 'Discord', href: 'https://discord.gg/FXTWvbpBY' },
  { label: 'YouTube', href: 'https://www.youtube.com/@Polykromy' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@polykromy' },
  { label: 'Instagram', href: 'https://www.instagram.com/polykromy.id/' },
]

/** Primary navigation. `sections` lists which tracked sections light each link up. */
export const NAV = [
  { href: '#story-scatter', label: 'Story', sections: ['arrive', 'scatter', 'construct', 'detail', 'form', 'leap'] },
  { href: '#games', label: 'Games', sections: ['games'] },
  { href: '#studio', label: 'Studio', sections: ['work', 'manifesto'] },
  { href: '#contact', label: 'Contact', sections: ['contact'] },
]
