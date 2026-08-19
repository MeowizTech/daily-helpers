import { useCallback } from "react";
import { useLocalStorage } from "../../lib/use-local-storage";
import { type AddResult, addOption, parseOptions } from "./decision";

const STORAGE_KEY = "daily-helpers:decision-options";

const SEED = ["中華", "和食", "イタリアン", "コンビニ"];

export type OptionStore = {
  readonly options: string[];
  readonly add: (raw: string) => AddResult;
  readonly remove: (value: string) => void;
};

export const useOptions = (): OptionStore => {
  const [options, setOptions] = useLocalStorage<string[]>(STORAGE_KEY, SEED, parseOptions);

  const add = useCallback(
    (raw: string): AddResult => {
      const result = addOption(options, raw);
      if (result.ok) setOptions(result.options);
      return result;
    },
    [options, setOptions],
  );

  const remove = useCallback(
    (value: string) => setOptions(options.filter((option) => option !== value)),
    [options, setOptions],
  );

  return { options, add, remove };
};
