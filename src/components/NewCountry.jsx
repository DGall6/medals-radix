import { useState } from "react";
import { Dialog, Flex, Button, Text, TextField } from "@radix-ui/themes";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { tc } from "../Utils.js";

function NewCountry(props) {
  const [showDialog, setShowDialog] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");

  function hideDialog() {
    setNewCountryName("");
    setShowDialog(false);
  }
  function handleSave() {
    if (newCountryName.length > 0) {
      props.onAdd(newCountryName);
      hideDialog();
    }
  }
  function handleKeyUp(e) {
    (e.keyCode ? e.keyCode : e.which) === 13 && handleSave();
  }
  const handleChange = (e) => {
    setNewCountryName(tc(e.target.value));
  };

  return (
    <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
      <Dialog.Trigger>
        <Button size="2" color="green" variant="soft">
          <PlusCircledIcon />
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Add Country</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Enter the country name.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              name="newCountryName"
              placeholder="Enter the country name"
              onChange={handleChange}
              value={newCountryName}
              autoComplete="off"
              onKeyUp={handleKeyUp}
            />
          </label>
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={(e) => hideDialog()}>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              onClick={handleSave}
              disabled={newCountryName.trim().length === 0}
            >
              Save
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default NewCountry;