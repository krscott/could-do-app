import { useState } from "react";
import Image from "next/image";
import { Button } from "./button";
import { TextInput } from "./text-input";
import { useCreateCommentMutation } from "../server/router/util";
import cuid from "cuid";
import { trpc } from "../utils/trpc";
import { DEFAULT_AVATAR_URL } from "./layout";
import SendSvg from "../../lib/tabler-icons/send.svg";

type CommentsProps = {
  taskId: string;
};

export const AddCommentForm = ({ taskId }: CommentsProps) => {
  const createComment = useCreateCommentMutation();

  const [comment, setComment] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();

        if (!comment) {
          return;
        }

        createComment.mutate({
          id: cuid(),
          taskId,
          comment,
        });

        setComment("");
      }}
    >
      <div className="flex-auto">
        <TextInput
          value={comment}
          placeholder="Comment"
          onChange={(ev) => setComment(ev.target.value)}
        />
      </div>
      <Button type="submit" className="px-2">
        <SendSvg className="scale-75" />
      </Button>
    </form>
  );
};

export const Comments = ({ taskId }: CommentsProps) => {
  const { data: comments, isLoading } = trpc.useQuery([
    "comment.getFromTask",
    { taskId },
  ]);

  if (isLoading) {
    return (
      <div className="w-full text-center text-gray-500">
        Loading comments...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {comments &&
        comments.map((comment) => (
          <div key={comment.id} className="flex flex-row gap-3">
            <div className="pt-1.5">
              <Image
                className="rounded-full"
                alt="avatar"
                width={32}
                height={32}
                src={comment.author.image || DEFAULT_AVATAR_URL}
              />
            </div>
            <div>
              <div className="text-gray-500 text-sm">
                {comment.author?.name}
              </div>
              <div>{comment.comment}</div>
            </div>
          </div>
        ))}
    </div>
  );
};
