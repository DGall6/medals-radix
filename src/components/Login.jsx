import { useState } from "react";
import { EnterIcon } from "@radix-ui/react-icons";
import {
  Button,
  Tooltip,
  Dialog,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";

function Login(props) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleModalKeyPress(e) {
    (e.keyCode ? e.keyCode : e.which) === 13 &&
      username.length > 0 &&
      password.length > 0 &&
      handleLogin();
  }

  function handleLogin() {
    props.onLogin(username, password);
    setOpen(false);
  }

  return (
    <>
      <Tooltip content="Login">
        <Button
          onClick={() => setOpen(true)}
          style={{ position: "fixed", bottom: 20, left: 20, zIndex: 100 }}
          variant="ghost"
        >
          <EnterIcon />
        </Button>
      </Tooltip>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content maxWidth="450px" onKeyUp={handleModalKeyPress}>
          <Dialog.Title>Log In</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Log in to your account
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                User Name
              </Text>
              <TextField.Root
                placeholder="Enter your user name"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                autoFocus
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Password
              </Text>
              <TextField.Root
                type="Password"
                placeholder="Enter your password"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button
                onClick={handleLogin}
                disabled={
                  username.trim().length === 0 || password.trim().length === 0
                }
              >
                Login
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

export default Login;