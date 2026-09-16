import "./Navbar.css"
import { HiMenu, HiX } from "react-icons/hi"
import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // From /reviews these sections don't exist, so go home first and then scroll
  const goToSection = (id) => (e) => {
    e.preventDefault()
    setIsOpen(false)

    const scroll = () => {
      const section = document.getElementById(id)
      if (section) section.scrollIntoView({ behavior: "smooth" })
    }

    if (pathname !== "/") {
      navigate("/")
      setTimeout(scroll, 150)
    } else {
      scroll()
    }
  }

  return (
    <nav>
      <Link className="logo" to="/" onClick={() => setIsOpen(false)}>
        <div className="logo-icon">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-text">CBE</span>
          <span className="logo-bracket">/&gt;</span>
        </div>
        <div className="logo-words">
          <span className="logo-name">CodeBy</span>
          <span className="logo-name2">Emmanuel</span>
        </div>
      </Link>

      <ul className={isOpen ? "nav-links active" : "nav-links"}>
        <li><a href="/#home" onClick={goToSection("home")}>Home</a></li>
        <li><a href="/#video-intro" onClick={goToSection("video-intro")}>Demo</a></li>
        <li><a href="/#pricing" onClick={goToSection("pricing")}>Pricing</a></li>
        <li><a href="/#reviews" onClick={goToSection("reviews")}>Reviews</a></li>
        <li><a href="/#faq" onClick={goToSection("faq")}>FAQ</a></li>
        <li><a href="/#contact" onClick={goToSection("contact")}>Contact</a></li>
      </ul>

      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <HiX size={30} /> : <HiMenu size={30} />}
      </div>
    </nav>
  )
}

export default Navbar