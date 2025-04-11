import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./styles.css";

const Gallery = ({ selectedImages, setSelectedImages }) => {
  const [images, setImages] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    fetch("https://galerija-server-render.onrender.com/api/images")
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
              src={`https://galerija-server-render.onrender.com/images/${encodeURIComponent(image)}`}
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
            <img src={`https://galerija-server-render.onrender.com/images/${enlargedImage}`} alt="Enlarged view" className="enlarged-image" />
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

const Checkout = ({ selectedImages, name, resetSelections }) => {
  const navigate = useNavigate();
  const total = selectedImages.length * 2;

  const handlePayment = (paymentMethod, orderID = null) => {
    if (!selectedImages.length) {
      alert("Molimo vas da odaberete slike pre nego što nastavite.");
      return;
    }

    const orderData = { name, selectedImages, paymentMethod, orderID };
    localStorage.setItem("orderData", JSON.stringify(orderData));

    fetch("https://galerija-server-render.onrender.com/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Porudžbina poslata:", data);

      fetch("https://galerija-server-render.onrender.com/api/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })
      .then(response => response.json())
      .then(data => {
        console.log("Štampanje pokrenuto:", data);
      })
      .catch(error => {
        console.error("Greška pri pokretanju štampe:", error);
      });

      // Resetuj izabrane slike i preusmeri na Confirmation
      resetSelections();
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
      <ul>
        {selectedImages.map((img, index) => (
          <li key={index}>{img}</li>
        ))}
      </ul>

      <div className="mt-4">
        <button onClick={() => handlePayment("cash")} className="button bg-gray full-width">
          Plati gotovinom na pultu
        </button>
      </div>
      <div className="mt-4">
        <PayPalScriptProvider options={{ "client-id": "Af6IBblLCyOierzsCuY4kCOlqwdh7tVFXCYiNfa9pWJ6X4O3Wx6g51ruM1XoJhk3qXguUhjkrAeGgkKT", currency: "EUR" }}>
          <PayPalButtons
            style={{ layout: "horizontal", color: "blue", shape: "rect", label: "pay" }}
            createOrder={async (data, actions) => {
              const response = await fetch("https://galerija-server-render.onrender.com/api/paypal/create-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ total }),
              });
              const orderData = await response.json();
              return orderData.id;
            }}
            onApprove={async (data, actions) => {
              const response = await fetch("https://galerija-server-render.onrender.com/api/paypal/capture-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const captureData = await response.json();
              if (captureData.capture.status === "COMPLETED") {
                handlePayment("paypal", data.orderID);
              } else {
                alert("Plaćanje nije uspešno završeno.");
              }
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              alert("Došlo je do greške prilikom plaćanja. Pokušajte ponovo.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

const Confirmation = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("orderData");
    if (storedData) {
      setOrderData(JSON.parse(storedData));
    }
    localStorage.removeItem("orderData");

    // Automatski preusmeri na početnu stranicu nakon 10 sekundi (opciono)
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 10000);

    return () => clearTimeout(timer); // Očisti tajmer ako korisnik ranije napusti stranicu
  }, [navigate]);

  const handleReturn = () => {
    navigate("/", { replace: true }); // Vraća na početnu stranicu sa zamjenom istorije
  };

  return (
    <div className="container text-center">
      <h2 className="heading">Hvala {orderData?.name}!</h2>
      <h2 className="heading">Porudžbina je prosleđena!</h2>
      <p>Preuzmite Vaše slike na pultu za 30 minuta.</p>
      <h3>Spisak poručenih slika:</h3>
      <ul>
        {orderData?.selectedImages.map((img, index) => (
          <li key={index}>{img}</li>
        ))}
      </ul>
      <div className="mt-4">
        <button onClick={handleReturn} className="button bg-blue full-width">
          Povratak na galeriju
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [name, setName] = useState("");

  const resetSelections = () => {
    setSelectedImages([]); // Resetuje izabrane slike
    setName(""); // Resetuje i ime
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Gallery selectedImages={selectedImages} setSelectedImages={setSelectedImages} />} />
        <Route path="/form" element={<Form name={name} setName={setName} />} />
        <Route path="/checkout" element={<Checkout selectedImages={selectedImages} name={name} resetSelections={resetSelections} />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
