import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/");
        setMessage(response.data.message);
        setError("");
      } catch (err) {
        setError("Failed to connect to backend");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ padding: "20px" }}>
      <h1>React Frontend</h1>
      {error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <div>
          <p>
            Backend says: <strong>{message}</strong>
          </p>
          <p>✅ Frontend and Backend are connected!</p>
        </div>
      )}
    </div>
  );
}

export default App;
