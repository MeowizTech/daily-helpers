import { useCallback, useMemo } from "react";
import { useLocalStorage } from "../../lib/use-local-storage";
import { createId, parseStockItems, type StockItem, sortByUrgency, toDateString } from "./stock";

const STORAGE_KEY = "daily-helpers:stock";

const seed = (): StockItem[] => {
  const day = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return toDateString(date);
  };
  return [
    { id: createId(), name: "卵", quantity: 6, expiry: day(3) },
    { id: createId(), name: "牛乳", quantity: 1, expiry: day(5) },
    { id: createId(), name: "米", quantity: 1, expiry: null },
  ];
};

export type StockStore = {
  readonly items: StockItem[];
  readonly today: string;
  readonly add: (item: Omit<StockItem, "id">) => void;
  readonly remove: (id: string) => void;
  readonly changeQuantity: (id: string, delta: number) => void;
};

export const useStock = (): StockStore => {
  const [items, setItems] = useLocalStorage<StockItem[]>(STORAGE_KEY, seed(), parseStockItems);

  // 日付は描画のたびに評価する。日付を跨いだまま開いていても次の操作で追従する
  const today = toDateString(new Date());

  const add = useCallback(
    (item: Omit<StockItem, "id">) => setItems([...items, { ...item, id: createId() }]),
    [items, setItems],
  );

  const remove = useCallback(
    (id: string) => setItems(items.filter((item) => item.id !== id)),
    [items, setItems],
  );

  const changeQuantity = useCallback(
    (id: string, delta: number) =>
      setItems(
        items.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, Math.min(999, item.quantity + delta)) }
            : item,
        ),
      ),
    [items, setItems],
  );

  const sorted = useMemo(() => sortByUrgency(items, today), [items, today]);

  return { items: sorted, today, add, remove, changeQuantity };
};
