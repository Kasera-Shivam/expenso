import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import AddExpense from "./AddExpense";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 w-screen max-w-full">
      <div className="flex h-full w-full items-center justify-between px-5">
        <Link to={"/"} title="Expenso : Home">
          <Logo />
        </Link>
        <div className="flex items-center space-x-8">
          {user && (
            <React.Fragment>
              <AddExpense>
                <Button>
                  <PlusIcon />
                  Add Expense
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
