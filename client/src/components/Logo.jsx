import { Link } from 'react-router-dom';

export default function Logo({ onDark = false }) {
  return (
    <Link to="/" className={`brand-logo ${onDark ? 'on-dark' : ''}`}>
      <span className="brand-mark">T</span>
      TaskListU
    </Link>
  );
}
