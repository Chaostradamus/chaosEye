// services/apiService.js
// services/apiService.js
const axios = require("axios");
require("dotenv").config();
// services/apiService.js

class SportsRadarAPI {
  constructor() {
    this.baseURL = "https://api.sportradar.com/nfl/official/trial/v7/en";
    this.apiKey = "ouq5rnvuViEjyGXMHLil0MHZRz7VuNjgMuGSIRI6";
  }

  async makeRequest(endpoint) {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`, {
        headers: {
          accept: "application/json",
          "x-api-key": this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error("SportsRadar API Error:", error.message);
      throw new Error("Failed to fetch data from SportsRadar API");
    }
  }

  async getAllTeams() {
    return await this.makeRequest("league/teams.json");
  }

  async getTeamRoster(teamId) {
    return await this.makeRequest(`teams/${teamId}/full_roster.json`);
  }

  async getPlayerById(playerId) {
    return await this.makeRequest(`players/${playerId}/profile.json`);
  }

  async getAllTeamsWithRosters() {
    try {
      console.log("🏈 Fetching all teams with rosters...");

      const teamsData = await this.getAllTeams();
      const teams = teamsData.teams || [];

      console.log(`📋 Found ${teams.length} teams`);

      const teamsWithRosters = [];

      for (const team of teams) {
        try {
          console.log(
            `   🔄 Getting roster for ${team.market} ${team.name}...`
          );
          const rosterData = await this.getTeamRoster(team.id);

          teamsWithRosters.push({
            id: team.id,
            name: team.name,
            market: team.market,
            alias: team.alias,
            players: rosterData.players || [],
          });

          console.log(
            `   ✅ ${team.name}: ${rosterData.players?.length || 0} players`
          );

          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `   ❌ Failed to get ${team.name} roster:`,
            error.message
          );
        }
      }

      return teamsWithRosters;
    } catch (error) {
      console.error("Error getting teams with rosters:", error);
      throw error;
    }
  }
}

module.exports = new SportsRadarAPI();
