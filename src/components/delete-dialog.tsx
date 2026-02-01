import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function DeleteDialog({
  dialogOpen,
  setDialogOpen,
  title,
  description,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="w-[95vw] max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="word">{description}</Label>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                onCancel!();
              }}
              data-testid="button-cancel"
              >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setDialogOpen(false);
                onConfirm();
              }}
              data-testid="button-delete-word"
              >
              Удалить слово
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}