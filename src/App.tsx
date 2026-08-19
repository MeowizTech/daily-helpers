import { DecisionScreen } from "./features/decision/decision-screen";
import { MenuScreen } from "./features/menu/menu-screen";
import { StockScreen } from "./features/stock/stock-screen";
import { useStock } from "./features/stock/use-stock";
import { UnitPriceScreen } from "./features/unit-price/unit-price-screen";
import { useRoute } from "./lib/router";

export const App = () => {
  const route = useRoute();
  // ストックはメニューの主役表示にも使うため、ここで1つだけ持つ
  const stock = useStock();

  switch (route) {
    case "unit-price":
      return <UnitPriceScreen />;
    case "stock":
      return <StockScreen store={stock} />;
    case "decision":
      return <DecisionScreen />;
    case "menu":
      return <MenuScreen store={stock} />;
  }
};
