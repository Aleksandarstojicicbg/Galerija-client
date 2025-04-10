import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import "./styles.css";

const Gallery = ({ selectedImages, setSelectedImages }) => {
  const [images, setImages] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/images")
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error("Greška pri učitavanju slika:", error));
  }, []);

  const handleCheckboxChange = (image) => {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(image)) {
        return prevSelectedImages.filter(img => img !== image);
      }
      return [...prevSelectedImages, image];
    });
  };

  const handleImageClick = (image) => {
    setEnlargedImage(image);
  };

  const closeEnlargedView = () => {
    setEnlargedImage(null);
  };

  return (
    <div className="gallery-container">
      <h1 className="title">Odaberite fotografije</h1>
      <div className="grid">
        {images.map((image) => (
          <div key={image} className="image-container">
            <input
              type="checkbox"
              className="image-checkbox"
              checked={selectedImages.includes(image)}
              onChange={() => handleCheckboxChange(image)}
            />
            <img
              src={`http://localhost:3001/images/${image}`}
              alt={image}
              className="image"
              onClick={() => handleImageClick(image)}
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/form" className="button bg-blue full-width">
          Dalje
        </Link>
      </div>
      {enlargedImage && (
        <div className="overlay" onClick={closeEnlargedView}>
          <div className="overlay-content">
            <img src={`http://localhost:3001/images/${enlargedImage}`} alt="Enlarged view" className="enlarged-image" />
          </div>
        </div>
      )}
    </div>
  );
};

const Form = ({ name, setName }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!name.trim()) {
      setError("Unos imena je obavezan!");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Unesite Vaše ime i prezime</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        className="input"
        placeholder="Ime i prezime"
      />
      {error && <p className="error-text">{error}</p>}
      <button onClick={handleNext} className="button bg-green mt-4 full-width">
        Dalje
      </button>
    </div>
  );
};

const Checkout = ({ selectedImages, name }) => {
  const total = selectedImages.length * 2;

  return (
    <div className="container">
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

const Confirmation = ({ name, selectedImages }) => (
  <div className="container text-center">
    <h2 className="heading">Hvala {name}!</h2>
    <h2 className="heading">Porudžbina prosleđena!</h2>
    <p>Preuzmite Vaše slike na pultu za 30 minuta.</p>
    <h3>Spisak poručenih slika:</h3>
    <ul>
      {selectedImages.map((image, index) => (
        <li key={index}>{image}</li>
      ))}
    </ul>
  </div>
);

const App = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [name, setName] = useState("");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Gallery selectedImages={selectedImages} setSelectedImages={setSelectedImages} />}
        />
        <Route path="/form" element={<Form name={name} setName={setName} />} />
        <Route path="/checkout" element={<Checkout selectedImages={selectedImages} name={name} />} />
        <Route path="/confirmation" element={<Confirmation name={name} selectedImages={selectedImages} />} />
      </Routes>
    </Router>
  );
};

export default App;
