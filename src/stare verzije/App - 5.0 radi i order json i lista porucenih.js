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
  const navigate = useNavigate();
  const total = selectedImages.length * 2;

  const handlePayment = () => {
    if (!selectedImages.length) {
      alert("Molimo vas da odaberete slike pre nego što nastavite.");
      return;
    }

    const orderData = { name, selectedImages };

    // 1️⃣ Čuvamo podatke u localStorage PRE slanja na server
    localStorage.setItem("orderData", JSON.stringify(orderData));

    // 2️⃣ Slanje porudžbine na server
    fetch("http://localhost:3001/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Porudžbina poslata:", data);

        // 3️⃣ Navigacija na Confirmation stranicu
        navigate("/confirmation");
      })
      .catch((error) => {
        console.error("Greška pri slanju porudžbine:", error);
        alert("Došlo je do greške prilikom slanja porudžbine. Pokušajte ponovo.");
      });
  };

  return (
    <div className="container">
      <h2 className="heading">Korpa</h2>
      <h2>Ime: {name}</h2>
      <h2>Broj slika: {selectedImages.length}</h2>
      <h2>Ukupna cena: {total} EUR</h2>
      <div className="mt-4">
        <button onClick={handlePayment} className="button bg-gray full-width">
          Plati gotovinom na pultu
        </button>
        <button className="button paypal bg-image full-width"></button>
      </div>
    </div>
  );
};

const Confirmation = () => {
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("orderData");
    if (storedData) {
      setOrderData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="container text-center">
      <h2 className="heading">Hvala {orderData?.name}!</h2>
      <h2 className="heading">Porudžbina je prosleđena!</h2>
      <p>Preuzmite Vaše slike na pultu za 30 minuta.</p>
      <h3>Spisak poručenih slika:</h3>
      <ul>
        {orderData?.selectedImages ? (
          orderData.selectedImages.map((image, index) => (
            <li key={index}>{image}</li>
          ))
        ) : (
          <p>Nema izabranih slika</p>
        )}
      </ul>
      <a href="http://localhost:3000/">Vratite se ponovo u Galeriju</a>
    </div>
  );
};

  




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
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
