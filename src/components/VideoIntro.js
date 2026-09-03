import React from "react";
import "./VideoIntro.css";

function VideoIntro() {
  return (
    <section className="video-intro">
      <h2>See how it works in under a minute</h2>
      <div className="video-wrapper">
        {/* playsInline and muted prevent mobile browsers from crashing or blocking the clip */}
        <video controls playsInline muted poster="/video-thumbnail.jpg">
          <source src="https://vimeo.com" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}

export default VideoIntro;