// Vector trace of the Polykromy mark (from the supplied logo, 1254px artboard).
// Shared by the inline SVG logo and the OGL extrusion so both stay identical.

export const MARK_VIEWBOX = '285 435 685 595'

export const MARK_PATHS = [
  // left eye
  'M585 482 L520 482 C492 470 452 443 400 443 C340 443 295 480 295 523 C295 567 338 603 392 603 L445 603 C482 603 508 590 532 562 Z',
  // right eye
  'M669 482 L734 482 C762 470 802 443 854 443 C914 443 959 480 959 523 C959 567 916 603 862 603 L809 603 C772 603 746 590 722 562 Z',
  // beak / body
  'M627 545 L735 660 L800 662 C845 662 883 700 883 740 C883 760 875 776 858 791 L627 1018 L396 791 C379 776 371 760 371 740 C371 700 409 662 454 662 L519 660 Z',
]

// Visual centre of the mark in artboard units, used to centre the 3D model.
export const MARK_CENTER = { x: 627, y: 730 }

export const COLORS = {
  sun: '#FDC003',
  ink: '#35028A',
  inkDeep: '#1E0156',
}
