import { useMemo, useState } from "react";

const basePrices = {
  PROFILED_SHEET: 2600,
  EURO_PICKET: 3400,
  CHAIN_LINK: 1450,
  GITTER_3D: 1850,
  WOOD: 3100,
  FORGED: 7200
};

export function FenceCalculatorExample() {
  const [fenceType, setFenceType] = useState<keyof typeof basePrices>("PROFILED_SHEET");
  const [length, setLength] = useState(72);
  const [height, setHeight] = useState(2);
  const [gates, setGates] = useState(1);
  const [wickets, setWickets] = useState(1);
  const [discount, setDiscount] = useState(5);

  const estimate = useMemo(() => {
    const materials = length * height * basePrices[fenceType];
    const posts = Math.ceil(length / 2.5) * 1850;
    const rails = length * 2 * 380;
    const extras = gates * 52000 + wickets * 22000 + length * 900;
    const subtotal = materials + posts + rails + extras;
    const total = subtotal * (1 - discount / 100);
    return { materials, posts, rails, extras, subtotal, total };
  }, [discount, fenceType, gates, height, length, wickets]);

  return (
    <form className="grid gap-4 rounded-lg border bg-background p-4">
      <label className="grid gap-2">
        Тип забора
        <select value={fenceType} onChange={(event) => setFenceType(event.target.value as keyof typeof basePrices)}>
          <option value="PROFILED_SHEET">Профнастил</option>
          <option value="EURO_PICKET">Евроштакетник</option>
          <option value="CHAIN_LINK">Сетка-рабица</option>
          <option value="GITTER_3D">3D-сетка</option>
          <option value="WOOD">Дерево</option>
          <option value="FORGED">Ковка</option>
        </select>
      </label>
      <label className="grid gap-2">
        Длина, м
        <input type="number" value={length} onChange={(event) => setLength(Number(event.target.value))} />
      </label>
      <label className="grid gap-2">
        Высота, м
        <input type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
      </label>
      <label className="grid gap-2">
        Ворота
        <input type="number" value={gates} onChange={(event) => setGates(Number(event.target.value))} />
      </label>
      <label className="grid gap-2">
        Калитки
        <input type="number" value={wickets} onChange={(event) => setWickets(Number(event.target.value))} />
      </label>
      <label className="grid gap-2">
        Скидка, %
        <input type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
      </label>
      <output className="rounded-lg bg-muted p-4 text-xl font-semibold">
        {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(estimate.total)}
      </output>
    </form>
  );
}
