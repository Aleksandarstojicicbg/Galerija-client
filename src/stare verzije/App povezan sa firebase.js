import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import "./styles.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firestore baze

const Gallery = ({ selectedImages, setSelectedImages }) => {
  const [images, setImages] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);


  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "images")); // Povlačimo slike iz Firestore kolekcije "images"
        const imageList = querySnapshot.docs.map((doc) => doc.data().url); // Uzimamo samo URL-ove slika
        setImages(imageList);
      } catch (error) {
        console.error("Greška pri učitavanju slika:", error);
      }
    };

    fetchImages();
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
    localStorage.setItem("orderData", JSON.stringify({ name, selectedImages }));
    const confirmationWindow = window.open("/confirmation", "_blank");
    
    if (confirmationWindow) {
      window.open("about:blank", "_self");
      window.close();
      
      
    }
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
        {orderData?.selectedImages.map((image, index) => (
          <li key={index}>{image}</li>
        ))}
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
