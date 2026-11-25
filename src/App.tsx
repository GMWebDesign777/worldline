import HeaderWorldline from "./components/templates/travel-agency-landing-page-worldline/Header Worldline";
import HowItWorksWorldline from "./components/templates/travel-agency-landing-page-worldline/How It Works Worldline";
import DestinationsWorldline from "./components/templates/travel-agency-landing-page-worldline/Destinations Worldline";
import WhyUsWorldline from "./components/templates/travel-agency-landing-page-worldline/Why Us Worldline";
import FooterWorldline from "./components/templates/travel-agency-landing-page-worldline/Footer Worldline";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeaderWorldline />
      <HowItWorksWorldline />
      <DestinationsWorldline />
      <WhyUsWorldline />
      <FooterWorldline />
    </main>
  );
}
