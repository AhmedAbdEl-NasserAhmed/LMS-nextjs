import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteLesson } from "../actions";
import { toast } from "sonner";

const DeleteLesson = ({
  chapterId,
  courseId,
  lessonId
}: {
  chapterId: string;
  courseId: string;
  lessonId: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [pending, startTransition] = useTransition();

  async function handleDeleteLesson() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteLesson({ courseId, lessonId, chapterId })
      );

      if (error) {
        toast.error("An unexpected error occurred. please try again");
        return;
      }

      if (result.status === "Success") {
        toast.success(result.message);
        setOpen(false);
      } else if (result.status === "Error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2Icon className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure that you want to delete this lesson ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action can not be undone. this lesson will deleted permanentely{" "}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDeleteLesson}
            disabled={pending}
            variant="destructive"
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLesson;
