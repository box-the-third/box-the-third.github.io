import Hero from "@/components/sections/Hero";
import Marquee from "@/components/ui/Marquee";
import Work from "@/components/sections/Work";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Offer from "@/components/sections/Offer";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Work />
      <About />
      <Services />
      <Offer />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
