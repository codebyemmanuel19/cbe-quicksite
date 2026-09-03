import React from "react";
import Home from "./components/Home";
import VideoIntro from "./components/VideoIntro";
import Pricing from "./components/Pricing";
import Reviews from "./components/Reviews";
import ContactCTA from "./components/ContactCTA";
import FAQ from "./components/FAQ";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Home />
      <VideoIntro/>
      <Pricing/>
      <Reviews/>
      <FAQ/>
      <ContactCTA/>
    </div>
  );
}

export default App;