// import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertDialog } from "@radix-ui/themes";

function CustomAlertDialog({ open, onOpenChange, title, description }) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description>
            {description}
          </AlertDialog.Description>
          
            <AlertDialog.Cancel>
              <button color="gray"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </AlertDialog.Cancel>
        </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

export default CustomAlertDialog;