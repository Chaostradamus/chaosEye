import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/`);
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
  },[API_URL]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      // const response = await axios.get(
      //   `http://localhost:5000/api/players/search?name=${searchTerm}`
      // );
      const response = await axios.get(
        `${API_URL}/api/players/search?name=${searchTerm}`
      );
      console.log("Search response:", response.data);
      setPlayers(response.data.data);
    } catch (err) {
      console.error("Search error:", err);
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
      <div style={{ marginTop: "30px" }}>
        <h2>Search NFL Players</h2>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter player name"
            style={{
              padding: "10px",
              marginRight: "10px",
              width: "300px",
              fontSize: "16px",
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {players.length > 0 ? (
          <div>
            <h3>Found {players.length} players:</h3>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  color: "black",
                }}
              >
                <h4 style={{ color: "black", margin: "0 0 10px 0" }}>
                  {player.name} #{player.jerseyNumber}
                </h4>
                <p style={{ color: "black", margin: "5px 0" }}>
                  <strong>Position:</strong> {player.position} |{" "}
                  <strong>Team:</strong> {player.team}
                </p>

                {player.stats && player.stats.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <h5 style={{ color: "black", margin: "10px 0 5px 0" }}>
                      {player.stats[0].season} Stats:
                    </h5>

                    {/* QUARTERBACK STATS */}
                    {player.position === "QB" &&
                      player.stats[0].passingYards && (
                        <div style={{ color: "black", margin: "5px 0" }}>
                          <p>
                            <strong>Passing:</strong>{" "}
                            {player.stats[0].passingYards} yards,{" "}
                            {player.stats[0].passingTouchdowns} TD,{" "}
                            {player.stats[0].interceptions} INT
                          </p>
                          <p>
                            <strong>Accuracy:</strong>{" "}
                            {player.stats[0].passingCompletions}/
                            {player.stats[0].passingAttempts} (
                            {player.stats[0].completionPercentage?.toFixed(1)}%)
                          </p>
                          <p>
                            <strong>Rating:</strong>{" "}
                            {player.stats[0].passerRating?.toFixed(1)} |{" "}
                            <strong>Sacks:</strong> {player.stats[0].sacks}
                          </p>
                        </div>
                      )}

                    {/* RUNNING BACK STATS */}
                    {player.position === "RB" &&
                      player.stats[0].rushingYards && (
                        <div style={{ color: "black", margin: "5px 0" }}>
                          <p>
                            <strong>Rushing:</strong>{" "}
                            {player.stats[0].rushingYards} yards,{" "}
                            {player.stats[0].rushingTouchdowns} TD
                          </p>
                          <p>
                            <strong>Efficiency:</strong>{" "}
                            {player.stats[0].rushingAttempts} att,{" "}
                            {player.stats[0].yardsPerCarry?.toFixed(1)} YPC
                          </p>
                          {player.stats[0].receptions && (
                            <p>
                              <strong>Receiving:</strong>{" "}
                              {player.stats[0].receptions} rec,{" "}
                              {player.stats[0].receivingYards} yards,{" "}
                              {player.stats[0].receivingTouchdowns} TD
                            </p>
                          )}
                        </div>
                      )}

                    {/* WIDE RECEIVER/TIGHT END STATS */}
                    {(player.position === "WR" || player.position === "TE") &&
                      player.stats[0].receivingYards && (
                        <div style={{ color: "black", margin: "5px 0" }}>
                          <p>
                            <strong>Receiving:</strong>{" "}
                            {player.stats[0].receptions} rec,{" "}
                            {player.stats[0].receivingYards} yards,{" "}
                            {player.stats[0].receivingTouchdowns} TD
                          </p>
                          <p>
                            <strong>Targets:</strong>{" "}
                            {player.stats[0].targets || "N/A"} |{" "}
                            <strong>YPR:</strong>{" "}
                            {player.stats[0].yardsPerReception?.toFixed(1) ||
                              "N/A"}
                          </p>
                          <p>
                            <strong>Efficiency:</strong>{" "}
                            {player.stats[0].drops || "0"} drops
                          </p>
                        </div>
                      )}

                    {/* DEFENSIVE PLAYER STATS */}
                    {(player.position === "LB" ||
                      player.position === "DB" ||
                      player.position === "DE") &&
                      player.stats[0].tackles && (
                        <div style={{ color: "black", margin: "5px 0" }}>
                          <p>
                            <strong>Tackles:</strong> {player.stats[0].tackles}{" "}
                            total ({player.stats[0].soloTackles} solo)
                          </p>
                          <p>
                            <strong>Impact Plays:</strong>{" "}
                            {player.stats[0].sacksMade} sacks,{" "}
                            {player.stats[0].interceptionsMade} INT,{" "}
                            {player.stats[0].passesDefended} PD
                          </p>
                          <p>
                            <strong>Forced Turnovers:</strong>{" "}
                            {player.stats[0].forcedFumbles} FF,{" "}
                            {player.stats[0].fumbleRecoveries} FR
                          </p>
                        </div>
                      )}

                    {/* UNIVERSAL STATS */}
                    <p
                      style={{
                        color: "black",
                        margin: "2px 0",
                        fontSize: "12px",
                      }}
                    >
                      <strong>Games:</strong> {player.stats[0].gamesPlayed}{" "}
                      played, {player.stats[0].gamesStarted || "0"} started |{" "}
                      <strong>Fumbles:</strong> {player.stats[0].fumbles || "0"}{" "}
                      ({player.stats[0].fumblesLost || "0"} lost)
                    </p>
                  </div>
                )}
                {player.stats && player.stats.length === 0 && (
                  <p style={{ color: "black", margin: "2px 0" }}>
                    No stats available for this player.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          searchTerm &&
          !searchLoading && (
            <p>
              No players found. Try "Mahomes", "McCaffrey", "Jefferson", etc.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default App;
