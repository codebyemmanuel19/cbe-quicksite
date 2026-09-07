import "./Navbar.css"
import { HiMenu, HiX } from "react-icons/hi"
import { useState } from "react"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav>
      <div className="logo">
        <div className="logo-icon">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-text">CBE</span>
          <span className="logo-bracket">/&gt;</span>
        </div>
        <div className="logo-words">
          <span className="logo-name">CodeBy</span>
          <span className="logo-name2">Emmanuel</span>
        </div>
      </div>

      <ul className={isOpen ? "nav-links active" : "nav-links"}>
        <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
        <li><a href="#video-intro" onClick={() => setIsOpen(false)}>Demo</a></li>
        <li><a href="#pricing" onClick={() => setIsOpen(false)}>Pricing</a></li>
        <li><a href="#reviews" onClick={() => setIsOpen(false)}>Reviews</a></li>
        <li><a href="#faq" onClick={() => setIsOpen(false)}>FAQ</a></li>
        <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
      </ul>

      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <HiX size={30} /> : <HiMenu size={30} />}
      </div>
    </nav>
  )
}

export default Navbar