export function getBackgroundColor(redListStatus: string): string {
  switch (redListStatus) {
    case "LC":
      return "#f8f9fa";
    case "NT":
      return "#f1f3f4";
    case "VU":
      return "#e8eaed";
    case "EN":
      return "#dadce0";
    case "CR":
      return "#bdc1c6";
    default:
      return "#f8f9fa";
  }
}

export function getTextColor(redListStatus: string): string {
  switch (redListStatus) {
    case "LC":
    case "NT":
    case "VU":
      return "#5f6368";
    case "EN":
      return "#3c4043";
    case "CR":
      return "#202124";
    default:
      return "#5f6368";
  }
}

export function getBorderColor(redListStatus: string): string {
  switch (redListStatus) {
    case "LC":
      return "#e8eaed";
    case "NT":
      return "#dadce0";
    case "VU":
      return "#bdc1c6";
    case "EN":
      return "#9aa0a6";
    case "CR":
      return "#5f6368";
    default:
      return "#e8eaed";
  }
}

export function getRedListStatusFullName(redListStatus: string): string {
  switch (redListStatus) {
    case "LC":
      return "Preocupación Menor";
    case "NT":
      return "Casi Amenazada";
    case "VU":
      return "Vulnerable";
    case "EN":
      return "En Peligro";
    case "CR":
      return "Críticamente Amenazada";
    case "EW":
      return "Extinta en Estado Silvestre";
    case "EX":
      return "Extinta";
    case "DD":
      return "Datos Deficientes";
    default:
      return redListStatus;
  }
}
