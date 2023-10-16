const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1 GET

app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT 
    *
    FROM 
    state;`;
  const stateArray = await db.all(getStatesQuery);
  const ans = (dbObject) => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.state_name,
      population: dbObject.population,
    };
  };
  response.send(stateArray.map((eachState) => ans(eachState)));
});

//API 2 GET
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    SELECT 
    *
    FROM 
    state
    WHERE 
    state_id = ${stateId};`;
  const state = await db.get(getStatesQuery);
  response.send(state);
});

//API 3 POST

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
    INSERT INTO 
    district(district_name, state_id, cases, cured, active, deaths)
    VALUES
    (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;
  const dbResponse = await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//API 4 GET

app.get("/districts/:districtId/", (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
    *
    FROM
    district
    WHERE
    district_id = ${districtId};`;
  const district = db.get(getDistrictQuery);
  response.send(district);
});

//API 5 DELETE

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    SELECT FROM 
    district
    WHERE 
    district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

// API 6 PUT

app.put("/districts/:districtId/", (request, response) => {
  const { districtId } = request.params;
  const addDistrictQuery = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = addDistrictQuery;
  const UpdateQuery = `
            UPDATE district 
            SET 
                district_name='${districtName}',
                state_id=${stateId},
                cases=${cases},
                cured=${cured},
                active=${active},
                deaths=${deaths}
            WHERE district_id=${districtId};`;
  db.run(UpdateQuery);
  response.send("District Details Updated");
});

//API 7 GET

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatesQuery = `
    SELECT
    SUM(cases),
    SUM(cured),
    SUM(active),
    SUM(deaths) 
    FROM 
    district
    WHERE 
    state_id = ${stateId};`;
  const states = await db.get(getStateStatesQuery);
  //console.log(states);
  response.send({
    totalCases: states["SUM(),cases"],
    totalCured: states["SUM(),cured"],
    totalActive: states["SUM(),active"],
    totalDeaths: states["SUM(),deaths"],
  });
});

//API 8 GET

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
}); //sending the required response
module.exports = app;
