import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableRowData } from "@/lib/alltype";

type DeleteConfirmationDialogProps = {
  data: TableRowData | null;
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onDeleted: () => void;
  dataToShow?: string | null;
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  data,
  isOpen,
  onClose,
  onDeleted,
  dataToShow = "this item",
  url,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (data) {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          onDeleted();
          onClose();
        } else {
          const resData = await response.json();
          setError(resData.message || "Failed to delete data");
        }
      } catch {
        setError("Error deleting item. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription className="space-y-2">
            <span>Are you sure you want to delete: {dataToShow}?</span>
            {error && (
              <span className="block text-red-500 text-sm">{error}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
