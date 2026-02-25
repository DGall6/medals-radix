import { useEffect, useState, useRef } from "react";
import Country from "./components/Country";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";

function App() {
  const [appearance, setAppearance] = useState("dark");
  // const apiEndpoint = "https://medals-api-v1-f9egftcjdydygngg.westus3-01.azurewebsites.net/api/country";
  const apiEndpoint = "http://localhost:5043/api/country";
  // const hubEndpoint = "https://medals-api-v1-f9egftcjdydygngg.westus3-01.azurewebsites.net/medalsHub";
  const hubEndpoint = "http://localhost:5043/medalsHub";
  const [connection, setConnection] = useState(null);
  const [countries, setCountries] = useState([]);
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);
  const latestCountries = useRef(null);
  // latestCountries is a ref variable to countries (state)
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;

  useEffect(() => {
    // initial data loaded here
    async function fetchCountries() {
      const { data: fetchedCountries } = await axios.get(apiEndpoint);
      // we need to save the original medal count values in state
      let newCountries = [];
      fetchedCountries.forEach((country) => {
        let newCountry = {
          id: country.id,
          name: country.name,
        };
        medals.current.forEach((medal) => {
          const count = country[medal.name];
          // page_value is what is displayed on the web page
          // saved_value is what is saved to the database
          newCountry[medal.name] = { page_value: count, saved_value: count };
        });
        newCountries.push(newCountry);
      });
      setCountries(newCountries);
    }
    fetchCountries();

    // signalR
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubEndpoint)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");

          connection.on("ReceiveAddMessage", (country) => {
            console.log(`Add: ${country.name}`);

            let newCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              newCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            // we need to use a reference to countries array here
            // since this useEffect has no dependeny on countries array - it is not in scope
            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.concat(newCountry);
            setCountries(mutableCountries);
          });

          connection.on("ReceiveDeleteMessage", (id) => {
            console.log(`Delete id: ${id}`);

            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.filter((c) => c.id !== id);
            setCountries(mutableCountries);
          });

          connection.on("ReceivePatchMessage", (country) => {
            console.log(`Patch: ${country.name}`);


            let updatedCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              updatedCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            let mutableCountries = [...latestCountries.current];
            const idx = mutableCountries.findIndex((c) => c.id === country.id);
            mutableCountries[idx] = updatedCountry;

            setCountries(mutableCountries);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
    // useEffect is dependent on changes to connection
  }, [connection]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }
  async function handleAdd(name) {
    try {
      await axios.post(apiEndpoint, { name: name });
    } catch (ex) {
      if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
    console.log("ADD");
  }
  async function handleDelete(countryId) {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== countryId));
    try {
      await axios.delete(`${apiEndpoint}/${countryId}`);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        console.log(
          "The record does not exist - it may have already been deleted"
        );
      } else {
        alert("An error occurred while deleting");
        setCountries(originalCountries);
      }
    }
  }
  function handleIncrement(countryId, medalName) {
    handleUpdate(countryId, medalName, 1);
  }
  function handleDecrement(countryId, medalName) {
    handleUpdate(countryId, medalName, -1);
  }
  function handleUpdate(countryId, medalName, factor) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName].page_value += 1 * factor;
    setCountries(mutableCountries);
  }
  async function handleSave(countryId) {
    const originalCountries = countries;

    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    medals.current.forEach((medal) => {
      if (country[medal.name].page_value !== country[medal.name].saved_value) {
        jsonPatch.push({
          op: "replace",
          path: medal.name,
          value: country[medal.name].page_value,
        });
        country[medal.name].saved_value = country[medal.name].page_value;
      }
    });
    console.log(
      `json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`
    );
    // update state
    setCountries(mutableCountries);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        console.log(
          "The record does not exist - it may have already been deleted"
        );
      } else {
        alert("An error occurred while updating");
        setCountries(originalCountries);
      }
    }
  }
  function handleReset(countryId) {
    // to reset, make page value the same as the saved value
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    medals.current.forEach((medal) => {
      country[medal.name].page_value = country[medal.name].saved_value;
    });
    setCountries(mutableCountries);
  }
  function getAllMedalsTotal() {
    let sum = 0;
    // use medal count displayed in the web page for medal count totals
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name].page_value, 0);
    });
    return sum;
  }

  return (
    <Theme appearance={appearance}>
      <Button
        onClick={toggleAppearance}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
        variant="ghost"
      >
        {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        <NewCountry onAdd={handleAdd} />
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" gap="2" className="grid-container">
        {countries
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              onDelete={handleDelete}
              onSave={handleSave}
              onReset={handleReset}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
    </Theme>
  );
}

export default App;