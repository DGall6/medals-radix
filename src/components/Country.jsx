import Medal from "./Medal";
import { Box, Table, Flex, Badge, Button } from "@radix-ui/themes";
import { TrashIcon, CheckIcon, ResetIcon } from "@radix-ui/react-icons";

function Country(props) {
  function getMedalsTotal() {
    let sum = 0;
    props.medals.forEach((medal) => {
      // use medal count displayed in the web page for medal count totals
      sum += props.country[medal.name].page_value;
    });
    return sum;
  }

  // determines if there are any difference between page_value and saved_value for any medals
  function renderSaveButton() {
    let unsaved = false;
    props.medals.forEach((medal) => {
      if (
        props.country[medal.name].page_value !==
        props.country[medal.name].saved_value
      ) {
        unsaved = true;
      }
    });
    return unsaved;
  }

  return (
    <Box width="300px">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell colSpan="2">
              <Flex justify="between">
                <span>
                  {props.country.name}
                  <Badge variant="outline" ml="2">
                    {getMedalsTotal(props.country, props.medals)}
                  </Badge>
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    justifyContent: "space-between",
                  }}
                >
                  {renderSaveButton() && (
                    <>
                      <Button
                        color="gray"
                        variant="ghost"
                        size="1"
                        onClick={() => props.onReset(props.country.id)}
                      >
                        <ResetIcon />
                      </Button>
                      <Button
                        color="gray"
                        variant="ghost"
                        size="1"
                        onClick={() => props.onSave(props.country.id)}
                      >
                        <CheckIcon />
                      </Button>
                    </>
                  )}
                  <Button color="red" variant="ghost" size="1">
                    <TrashIcon
                      onClick={() => props.onDelete(props.country.id)}
                    />
                  </Button>
                </div>
              </Flex>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.medals
            .sort((a, b) => a.rank - b.rank)
            .map((medal) => (
              <Medal
                key={medal.id}
                medal={medal}
                country={props.country}
                onIncrement={props.onIncrement}
                onDecrement={props.onDecrement}
              />
            ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default Country;