import { Box, Table, Flex, Badge, Button } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import MedalSvg from "./MedalSvg.jsx";
import { tc } from "../Utils.js";

function Medal(props) {
  return (
    <Table.Row>
      <Table.RowHeaderCell>
        <Flex align="center">
          <MedalSvg color={props.medal.color} />
          <Box pl="2">{tc(props.medal.name)} Medals</Box>
        </Flex>
      </Table.RowHeaderCell>
      <Table.Cell align="right" width="108px">
        <Flex align="center" justify="between">
          <Button
            variant="ghost"
            disabled={props.country[props.medal.name] === 0}
          >
            <MinusIcon
              onClick={() =>
                props.country[props.medal.name] > 0 &&
                props.onDecrement(props.country.id, props.medal.name)
              }
            />
          </Button>
          <Badge variant="outline">{props.country[props.medal.name]}</Badge>
          <Button variant="ghost">
            <PlusIcon
              onClick={() =>
                props.onIncrement(props.country.id, props.medal.name)
              }
            />
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}

export default Medal;