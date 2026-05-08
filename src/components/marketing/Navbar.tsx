import NavbarClient from './NavbarClient';

export default function Navbar({ showNavLinks }: { showNavLinks?: boolean }) {
  return <NavbarClient showNavLinks={showNavLinks} />;
}
