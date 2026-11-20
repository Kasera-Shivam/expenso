import { Link } from "react-router";
import { LINKS } from "@/lib/link";
import Logo from "./Logo";

const Footer = () => (
  <footer className="border-t-muted mt-auto w-screen max-w-full border-t">
    <div className="text-muted-foreground flex flex-col items-center justify-between gap-3 px-5 py-4 text-sm sm:flex-row">
      <div className="flex items-center gap-2">
        <Logo className="text-foreground text-base" />
        <span>© {new Date().getFullYear()}. Track every rupee.</span>
      </div>
      <nav className="flex items-center gap-4">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="hover:text-foreground transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default Footer;
