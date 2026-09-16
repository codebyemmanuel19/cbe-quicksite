import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import VideoIntro from "./components/VideoIntro";
import Pricing from "./components/Pricing";
import Reviews from "./components/Reviews";
import ReviewsPage from "./components/ReviewsPage";
import ContactCTA from "./components/ContactCTA";
import FAQ from "./components/FAQ";
import "./App.css";

// The landing page, exactly as it was
function Landing() {
  return (
    <>
      <Home />
      <VideoIntro />
      <Pricing />
      <Reviews />
      <FAQ />
      <ContactCTA />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;