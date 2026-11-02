import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const UpdateAccount = ({ open, onOpenChange }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Update account</DialogTitle>
      </DialogHeader>
      {/* form yahan, onSuccess={() => onOpenChange(false)} */}
    </DialogContent>
  </Dialog>
);

export default UpdateAccount;
