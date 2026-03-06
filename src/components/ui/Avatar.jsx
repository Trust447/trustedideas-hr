// src/components/ui/Avatar.jsx
import { getInitials } from '../../utils/formatters.js';

const COLORS = [
  '#C4622D','#2D6A4F','#1E40AF','#B45309',
  '#5B21B6','#9B1C1C','#0E7490','#854D0E',
];

function colorFromName(name = '') {
  const idx = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLORS.length;
  return COLORS[idx];
}

export default function Avatar({ firstName = '', lastName = '', size = 'sm' }) {
  const initials = getInitials(firstName, lastName);
  const bg = colorFromName(`${firstName}${lastName}`);
  return (
    <div
      className={`avatar ${size === 'lg' ? 'lg' : ''}`}
      style={{ background: bg }}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}
