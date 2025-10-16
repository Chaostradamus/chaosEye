import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/players/search?name=${searchTerm}`
      );
      console.log('Search response:', response.data);
      setPlayers(response.data.data);
    } catch (err) {
      console.error('Search error:', err);
      setPlayers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>NFL Player Stats</h1>
      
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

      {/* Search Component */}
      <div style={{ marginTop: '30px' }}>
        <h2>Search NFL Players</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter player name"
            style={{ 
              padding: '10px', 
              marginRight: '10px',
              width: '300px',
              fontSize: '16px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch} 
            disabled={searchLoading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Results */}
        {players.length > 0 ? (
          <div>
            <h3>Found {players.length} players:</h3>
            {players.map(player => (
              <div 
                key={player.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  margin: '10px 0',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  color: 'black'
                }}
              >
                <h4 style={{ color: 'black', margin: '0 0 10px 0' }}>
                  {player.name} #{player.jerseyNumber}
                </h4>
                <p style={{ color: 'black', margin: '5px 0' }}>
                  <strong>Position:</strong> {player.position} | <strong>Team:</strong> {player.team}
                </p>
                
                {player.stats && player.stats.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <h5 style={{ color: 'black', margin: '10px 0 5px 0' }}>2024 Stats:</h5>
                    {player.stats[0].passingYards !== null && player.stats[0].passingYards !== undefined && (
                      <p style={{ color: 'black', margin: '2px 0' }}>
                        Passing: {player.stats[0].passingYards} yards, {player.stats[0].passingTouchdowns} TD
                      </p>
                    )}
                    {player.stats[0].rushingYards !== null && player.stats[0].rushingYards !== undefined && (
                      <p style={{ color: 'black', margin: '2px 0' }}>
                        Rushing: {player.stats[0].rushingYards} yards, {player.stats[0].rushingTouchdowns} TD
                      </p>
                    )}
                    {player.stats[0].receptions !== null && player.stats[0].receptions !== undefined && (
                      <p style={{ color: 'black', margin: '2px 0' }}>
                        Receiving: {player.stats[0].receptions} catches, {player.stats[0].receivingYards} yards, {player.stats[0].receivingTouchdowns} TD
                      </p>
                    )}
                  </div>
                )}
                
                {(player.stats && player.stats.length === 0) && (
                  <p style={{ color: 'black', margin: '2px 0' }}>
                    No stats available for this player.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : searchTerm && !searchLoading && (
          <p>No players found. Try "Mahomes", "McCaffrey", "Jefferson", etc.</p>
        )}
      </div>
    </div>
  );
}

export default App;