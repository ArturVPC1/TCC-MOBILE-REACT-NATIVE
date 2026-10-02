// Na web a digitação com máscara dd/mm/aaaa é suficiente; o seletor nativo não existe.
export function DatePickerModal(_: { visible: boolean; value: Date; onClose: () => void; onPick: (d: Date) => void }) {
  return null;
}
