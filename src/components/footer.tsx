import { Gamepad2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full mt-auto">
      <div className="container mx-auto flex items-center justify-center p-4 text-sm text-muted-foreground">
        <Gamepad2 className="mr-2 h-4 w-4" />
        <span>© {new Date().getFullYear()} PlayVerse. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
