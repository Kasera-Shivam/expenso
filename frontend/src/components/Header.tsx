import { Link, NavLink } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/link";
import Logo from "./Logo";
import AddExpense from "./AddExpense";
import { Button, buttonVariants } from "./ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="border-b-muted h-16 w-screen max-w-full border-b">
      <div className="flex h-full w-full items-center justify-between px-5">
        <Link to={"/"} title="Expenso : Home">
          <Logo />
        </Link>
        <div className="flex items-center space-x-3 sm:space-x-6">
          {user && (
            <React.Fragment>
              {/* Large screens: nav buttons live in the header. Smaller screens use the profile menu. */}
              <nav className="hidden items-center gap-1 lg:flex">
                {NAV.map(({ to, label, icon: Icon }, index) => (
                  <NavLink
                    key={index}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        buttonVariants({
                          variant: isActive ? "secondary" : "ghost",
                          size: "default",
                        }),
                        !isActive && "text-muted-foreground",
                      )
                    }
                  >
                    <Icon className="size-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <AddExpense>
                <Button aria-label="Add expense">
                  <PlusIcon />
                  <span className="hidden sm:inline">Add Expense</span>
                </Button>
              </AddExpense>

              <ProfileDropdown />
            </React.Fragment>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
