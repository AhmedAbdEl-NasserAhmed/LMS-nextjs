"use client";

import { ReactNode, useEffect, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { reorderChapter, reorderLesson } from "../actions";
import DeleteChapter from "./DeleteChapter";
import DeleteLesson from "./DeleteLesson";
import NewChapterModal from "./NewChapterModal";
import NewLessonModal from "./NewLessonModal";
import { AdminCourseEditType } from "@/lib/data/admin/admin";

interface Props {
  data: AdminCourseEditType;
}

const CourseStructure = ({ data }: Props) => {
  const initialItems =
    data.chapter.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position
      }))
    })) || [];

  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems((prevItems) => {
      const updatedItems =
        data.chapter.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          isOpen:
            prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position
          }))
        })) || [];
      return updatedItems;
    });
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type as "chapter" | "lesson";
    const overType = over.data.current?.type as "chapter" | "lesson";
    const courseId = data.id;

    if (activeType === "chapter") {
      let targetChapterId = null;
      if (overType === "chapter") {
        targetChapterId = overId;
      } else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }

      if (!targetChapterId) {
        toast.error("Could not determine the chapter for reordering");
        return;
      }
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === targetChapterId);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("could not find chapter old/new index for reordering");
        return;
      }

      const reorderLocalChapters = arrayMove(items, oldIndex, newIndex);

      const updatedChapterForState = reorderLocalChapters.map(
        (chapter, index) => ({
          ...chapter,
          order: index + 1
        })
      );

      const previousItems = [...items];

      setItems(updatedChapterForState);

      if (courseId) {
        const chaptersToUpdate = updatedChapterForState.map((chapter) => ({
          id: chapter.id,
          position: chapter.order
        }));

        const reorderChapterPromise = () =>
          reorderChapter(courseId, chaptersToUpdate);

        toast.promise(reorderChapterPromise(), {
          loading: "Reordering Chapters",
          success: (result) => {
            if (result.status === "Success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder chapters";
          }
        });
      }
      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;

      if (!chapterId || chapterId !== overChapterId) {
        toast.error(
          "lesson move between different chapters or invalid Chapter ID is not allowed"
        );
        return;
      }

      const chapterIndex = items.findIndex(
        (chapter) => chapter.id === chapterId
      );

      if (chapterIndex === -1) {
        toast.error("Could not find chapter for lesson");
        return;
      }

      const chapterToUpdate = items[chapterIndex];

      const oldLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === activeId
      );

      const newLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === overId
      );

      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        toast.error("Could not find lesson for reordering");
        return;
      }
      const reorderedLessons = arrayMove(
        chapterToUpdate.lessons,
        oldLessonIndex,
        newLessonIndex
      );

      const updatedLessonForState = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));

      const newItems = [...items];

      newItems[chapterIndex] = {
        ...chapterToUpdate,
        lessons: updatedLessonForState
      };

      const previousItems = [...items];

      setItems(newItems);

      if (courseId) {
        const lessonsToUpdate = updatedLessonForState.map((lesson) => ({
          id: lesson.id,
          position: lesson.order
        }));

        const reorderLessonPromise = () =>
          reorderLesson(chapterId, lessonsToUpdate, courseId);

        toast.promise(reorderLessonPromise(), {
          loading: "Reordering Lessons",
          success: (result) => {
            if (result.status === "Success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder lesson";
          }
        });
      }
      return;
    }
  }

  function SortableItem(props: {
    id: string;
    children: (listeners: DraggableSyntheticListeners) => ReactNode;
    className?: string;
    data?: {
      type: "chapter" | "lesson";
      chapterId?: string;
    };
  }) {
    const {
      attributes,
      listeners,
      isDragging,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id: props.id, data: props.data });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn("touch-none", props.className, isDragging ? "z-10" : "")}
      >
        {props.children(listeners)}
      </div>
    );
  }

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter
      )
    );
  }

  return (
    <DndContext
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Card>
        <CardHeader className="flex items-center justify-between flex-row border-b border-border">
          <CardTitle>Chapters</CardTitle>
          <NewChapterModal courseId={data.id} />
        </CardHeader>
        <CardContent className="space-y-8">
          <SortableContext strategy={verticalListSortingStrategy} items={items}>
            {items.map((item) => (
              <SortableItem
                id={item.id}
                data={{ type: "chapter" }}
                key={item.id}
              >
                {(listeners) => (
                  <Card>
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)}
                    >
                      <div className="flex items-center justify-between p-3 border border-b border-border">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            {...listeners}
                          >
                            <GripVertical className="size-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              type="button"
                              className="flex items-center"
                            >
                              {item.isOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <p className="cursor-pointer hover:text-primary pl-2">
                            {item.title}
                          </p>
                        </div>
                        <DeleteChapter courseId={data.id} chapterId={item.id} />
                      </div>
                      <CollapsibleContent>
                        <div className="p-1">
                          <SortableContext
                            items={item.lessons.map((lesson) => lesson.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {item.lessons.map((lesson) => (
                              <SortableItem
                                id={lesson.id}
                                key={lesson.id}
                                data={{ type: "lesson", chapterId: item.id }}
                              >
                                {(lesssonListeners) => (
                                  <div className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                                    <div className="flex items-center gap-2 ">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        {...lesssonListeners}
                                      >
                                        <GripVertical className="size-4" />
                                      </Button>
                                      <FileText className="size-4" />
                                      <Link
                                        href={`/admin/courses/${data.id}/${lesson.id}/${lesson.id}`}
                                      >
                                        {lesson.title}
                                      </Link>
                                    </div>
                                    <DeleteLesson
                                      courseId={data.id}
                                      chapterId={item.id}
                                      lessonId={lesson.id}
                                    />
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableContext>
                          <div className="p-2">
                            <NewLessonModal
                              chapterId={item.id}
                              courseId={data.id}
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
};

export default CourseStructure;
