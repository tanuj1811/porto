import Cursor from "./Cursor";
import NavbarxScrollbar from "./NavbarxScrollbar";
import SocialIcons from "./SocialIcons";
import HomeSection from "./sections/Home";
import Career from "./sections/Career";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";
import TechStack from "./sections/TechStack";
import { NAV_SECTIONS } from "@/utils/constant";

const MainContainer = ({ children }: { children: React.ReactNode }) => {

  return (
    <div className="container-main">
      <Cursor />
      <SocialIcons />
      <NavbarxScrollbar
        sections={NAV_SECTIONS}
        side="right"
        glowColor="#7dd3fc"
      />
      <HomeSection />
      <Career />
      <Projects />
      <TechStack />
      <Contact />
      {children}
      {/* <Cursor />
      <Navbar />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <TechStack />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default MainContainer;
