import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import "./styles.css";

const Gallery = ({ selectedImages, setSelectedImages }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/images")
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error("Greška pri učitavanju slika:", error));
  }, []);

  // Funkcija za selektovanje slika
  const handleImageClick = (image) => {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(image)) {
        // Ako je slika već selektovana, ukloni je
        return prevSelectedImages.filter(img => img !== image);
      }
      // Ako nije selektovana, dodaj je
      return [...prevSelectedImages, image];
    });
  };

  return (
    <div className="gallery-container">
      <h1 className="title">Odaberite fotografije</h1>
      <div className="grid">
        {images.map((image) => (
          <div key={image} className="image-container" onClick={() => handleImageClick(image)}>
            <img
              src={`http://localhost:3001/images/${image}`}
              alt={image}
              className={`image ${selectedImages.includes(image) ? "selected" : ""}`}  // Obeleži selektovane slike
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/form" className="button bg-blue full-width">
          Dalje
        </Link>
      </div>
    </div>
  );
};

const Form = ({ name, setName }) => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <h1 className="heading">Unesite Vaše ime i prezime</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
        placeholder="Ime i prezime"
      />
      <button onClick={() => navigate("/checkout")} className="button bg-green mt-4 full-width"  disabled={!name}>
        Dalje
      </button>
    </div>
  );
};

const Checkout = ({ selectedImages, name }) => {
  const total = selectedImages.length * 2;  // Pretpostavljamo da je cena 2 EUR po slici

  return (
    <div className="container" >
      <h2 className="heading">Korpa</h2>
      <h2>Ime: {name}</h2>
      <h2>Broj slika: {selectedImages.length}</h2>
      <h2>Ukupna cena: {total} EUR</h2>
      <div className="mt-4">
        <Link to="/confirmation" className="button bg-gray">
          Plati gotovinom na pultu
        </Link>
        <button className="bg-image paypal"></button>
        </div>
    </div>
  );
};

const Confirmation = ({ name }) => (
  <div className="container text-center">
    <h2 className="heading">Hvala {name}!</h2>
    <h2 className="heading">Porudžbina prosleđena!</h2>
    <p>Preuzmite Vaše slike na pultu za 30 minuta.</p>
    <p>Spisak poručenih slika</p>
  </div>
);

const App = () => {
  const [selectedImages, setSelectedImages] = useState([]);  // Slikama u korpi
  const [name, setName] = useState("");  // Ime kupca

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Gallery selectedImages={selectedImages} setSelectedImages={setSelectedImages} />}
        />
        <Route path="/form" element={<Form name={name} setName={setName} />} />
        <Route path="/checkout" element={<Checkout selectedImages={selectedImages} name={name} />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
