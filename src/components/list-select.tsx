import type { ChangeEventHandler } from "react";
import { trpc } from "../utils/trpc";
import SelectMenu from "./select-menu";

type ListSelectProps = {
  listSlug: string | null;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  extraFields?: [string, string][];
};

export const ListSelect = ({
  listSlug,
  onChange,
  extraFields,
}: ListSelectProps): JSX.Element => {
  const { data: lists } = trpc.useQuery(["tasklist.getAll"]);

  return (
    <div className="w-full">
      <SelectMenu value={listSlug || ""} onChange={onChange}>
        {extraFields?.map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
        <option value="">Main</option>
        {lists?.map((list) => (
          <option key={list.slug} value={list.slug}>
            {list.name}
          </option>
        ))}
      </SelectMenu>
    </div>
  );
};
