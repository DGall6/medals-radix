import { useEffect, useState, useRef } from "react";
import Country from "./components/Country";
import Login from "./components/Login";
import Logout from "./components/Logout";
import CustomAlertDialog from "./components/CustomAlertDialog.jsx";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
  Callout,
  Box
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";
import axios from "axios";
import { getUser } from "./Utils.js";
import { HubConnectionBuilder } from "@microsoft/signalr";

function App() {
  const [appearance, setAppearance] = useState("dark");
  // const apiEndpoint = "https://medalsapi.azurewebsites.net/api/country";
  const apiEndpoint = "https://medalsapi.azurewebsites.net/jwtapi/country";
  const hubEndpoint = "https://medalsapi.azurewebsites.net/medalsHub";
  const userEndpoint = "https://jwtswagger.azurewebsites.net/api/user/login";
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDesc, setAlertDesc] = useState("");

  const [toasts, setToasts] = useState([]);
  
  const [connection, setConnection] = useState(null);
  const [countries, setCountries] = useState([]);
  const [user, setUser] = useState({
    name: null,
    authenticated: false,
    canPost: false,
    canPatch: false,
    canDelete: false,
  });
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);
  const latestCountries = useRef(null);
  // latestCountries is a ref variable to countries (state)
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;

  const showAlert = (title, description) => {
    setAlertTitle(title);
    setAlertDesc(description);
    setAlertOpen(true);
  };

  const addToast = (message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

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

    const encoded = localStorage.getItem("token");
    // check for existing token
    encoded && setUser(getUser(encoded));

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

          // TODO: Change to Radix UI callout green
          console.log("Connected!");
          addToast("Connected!", "success");

          connection.on("ReceiveAddMessage", (country) => {

            // TODO: Change to Radix UI callout grey
            console.log(`Add: ${country.name}`);
            addToast(`Adding: ${country.name}`);

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

            // TODO: Change to Radix UI callout green
            console.log(`Successfully added: ${country.name}`);
            addToast(`Successfully added: ${country.name}`, "success");
          });

          connection.on("ReceiveDeleteMessage", (id) => {

            // TODO: Change to Radix UI callout grey
            console.log(`Delete id: ${id}`);
            addToast(`Deleting country with id: ${id}`, "info");

            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.filter((c) => c.id !== id);
            setCountries(mutableCountries);

            // TODO: Change to Radix UI callout green
            console.log(`Successfully deleted country with id: ${id}`);
            addToast(`Successfully deleted country with id: ${id}`, "success")
          });

          connection.on("ReceivePatchMessage", (country) => {

            // TODO: Change to Radix UI callout grey
            console.log(`Patch: ${country.name}`);
            addToast(`Patching: ${country.name}`, "info");


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

            // TODO: Change to Radix UI callout green
            console.log(`Successfully Patched: ${country.name}`);
            addToast(`Successfully Patched: ${country.name}`, "success");
          });
        })

        // TODO: Change to Radix UI element
        .catch((e) => 
          addToast(`Connection failed: ${e}`, "error")
      );
    }
    // useEffect is dependent on changes to connection
  }, [connection]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }
  async function handleAdd(name) {
    try {
      await axios.post(
        apiEndpoint,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (ex) {
      if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {

        // TODO: Change to Radix UI alert dialog
        // alert("You are not authorized to complete this request");
        showAlert("Authorization Failed", "You are not authorized to complete this request");

      } else if (ex.response) {

        // TODO: Change to Radix UI callout alert
        console.log(ex.response);
        addToast(ex.response, "error");


      } else {

        // TODO: Change to Radix UI callout alert
        console.log("Request failed");
        addToast("Request Failed", "error");
      }
    }

    // TODO: Change to Radix UI callout green
    console.log("Succeffully Added");
    addToast("Successfully Added", "success");

  }
  async function handleDelete(countryId) {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== countryId));
    try {
      await axios.delete(`${apiEndpoint}/${countryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted

        // TODO: Change to Radix UI callout red
        console.log(
          "The record does not exist - it may have already been deleted"
        );
        addToast("The record does not exist - it may have already been deleted", "error");


      } else {
        setCountries(originalCountries);
        if (
          ex.response &&
          (ex.response.status === 401 || ex.response.status === 403)
        ) {

          // TODO: Change to Radix UI dialog alert
        // alert("You are not authorized to complete this request");
        showAlert("Authorization Failed", "You are not authorized to complete this request");

        
        } else if (ex.response) {

          // TODO: Change to Radix UI callout green
          console.log(ex.response);
          addToast(ex.response, "error");


        } else {

          // TODO: Change to Radix UI callout alert
          console.log("Request failed");
          addToast("Request failed", "error");

        }
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

    // TODO: Change to Radix UI callout
    console.log(
      `json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`
    );
    addToast(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`, "info")


    // update state
    setCountries(mutableCountries);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted

        // TODO: Change to Radix UI callout green
        console.log(
          "The record does not exist - it may have already been deleted"
        );
        addToast("The record does not exist - it may have already been deleted", "error")


      } else if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {

        // TODO: Change to Radix UI alert dialog
        // alert("You are not authorized to complete this request");
        showAlert("Authorization Failed", "You are not authorized to complete this request");

        // to simplify, I am reloading the page to restore "saved" values
        window.location.reload(false);
      } else {

        // TODO: Change to Radix UI alert dialog
        alert("An error occurred while updating");
        showAlert("Save Failed", "An error occurred while updating");

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
  async function handleLogin(username, password) {
    try {
      const resp = await axios.post(userEndpoint, {
        username: username,
        password: password,
      });
      const encoded = resp.data.token;
      localStorage.setItem("token", encoded);
      setUser(getUser(encoded));
    } catch (ex) {
      if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 400)
      ) {
        // TODO: Change to Radix UI alert dialog
        // alert("Login failed");
        showAlert("Login Failed", "Invalid username or password");
      } else if (ex.response) {
        // TODO: Change to Radix UI callout green
        console.log(ex.response);
        addToast(`Login failed: ${ex.response}`, "error")
      } else {
        // TODO: Change to Radix UI callout alert
        console.log("Login failed");
        addToast(`Login failed`, "error")
      }
    }
  }
  function handleLogout() {
    localStorage.removeItem("token");
    setUser({
      name: null,
      authenticated: false,
      canPost: false,
      canPatch: false,
      canDelete: false,
    });
    addToast("Successfully logged out", "success")
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
      {user.authenticated ? (
        <Logout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        {user.canPost && <NewCountry onAdd={handleAdd} />}
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
              canDelete={user.canDelete}
              canPatch={user.canPatch}
              onDelete={handleDelete}
              onSave={handleSave}
              onReset={handleReset}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
      <CustomAlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        description={alertDesc}
      />

      <div
        style={{
          position: "fixed",
          bottom: "50px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 999,
          maxWidth: "400px"
        }}
      >
        {toasts.map((toast) => (
          <Callout.Root
            variant="soft"
            highContrast
            key={toast.id}
            color={toast.type === "error" ? "red" : 
              toast.type === "success" ? "green" : "gray"
            }
            role={toast.type === "error" ? "alert" : "status"}
          >
            <Callout.Text>
              {toast.message}
            </Callout.Text>

          </Callout.Root>
        ))}
      </div>
    </Theme>
  );
}

export default App;