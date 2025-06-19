import { ReactNode } from "react";
import { Navbar } from "./_components/navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="container mx-auto px-4 md:px-6 lg:px-8">
      <Navbar />
      {children}
    </main>
  );
};

export default Layout;
