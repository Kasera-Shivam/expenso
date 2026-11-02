import { Link } from "react-router";

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center gap-2 py-28">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-muted-foreground">This page does not exist.</p>
    <Link to="/" className="underline">
      Go home
    </Link>
  </main>
);

export default NotFound;
