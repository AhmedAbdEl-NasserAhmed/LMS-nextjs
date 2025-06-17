import { ModeToggle } from "./modeToggle";

const Navbar = () => {
  return (
    <nav className=" p-4 h-[40px] flex justify-end">
      <ModeToggle />
    </nav>
  );
};

export default Navbar;
