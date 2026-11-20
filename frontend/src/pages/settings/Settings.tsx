import { Link } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileSection from "@/components/settings/ProfileSection";
import PasswordSection from "@/components/settings/PasswordSection";
import SessionsSection from "@/components/settings/SessionsSection";

const Settings = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5">
    <div>
      <Button asChild variant="ghost" size="sm" className="-ml-2.5">
        <Link to="/">
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
      </Button>
    </div>
    <h2 className="text-xl font-bold tracking-tight">Settings</h2>
    <ProfileSection />
    <PasswordSection />
    <SessionsSection />
  </div>
);

export default Settings;
