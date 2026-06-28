export interface Section {
  code: string;
  name: string;
  flag: string;
  isSpecial?: boolean;
}



export const STAR_PLAYERS: { [key: string]: string } = {
  // FWC
  "FWC00": "Escudo FIFA World Cup 2026",
  "FWC1": "Mascota Oficial Mundial 2026",
  "FWC2": "Estadio Azteca (CDMX)",
  "FWC3": "Estadio MetLife (New York)",
  "FWC4": "Estadio BC Place (Vancouver)",
  "FWC5": "Trofeo de la Copa del Mundo",
  "FWC10": "Póster Oficial de la Copa",

  // Argentina
  "ARG1": "Emiliano Martínez (GK)",
  "ARG4": "Cristian Romero",
  "ARG7": "Rodrigo de Paul",
  "ARG8": "Enzo Fernández",
  "ARG9": "Julián Álvarez",
  "ARG10": "Lionel Messi",
  "ARG11": "Ángel Di María",
  "ARG13": "Alexis Mac Allister",
  "ARG19": "Lautaro Martínez",

  // Brasil
  "BRA1": "Alisson Becker (GK)",
  "BRA3": "Marquinhos",
  "BRA5": "Casemiro",
  "BRA7": "Vinícius Jr",
  "BRA9": "Richarlison",
  "BRA10": "Neymar Jr",
  "BRA11": "Rodrygo Goes",

  // Francia
  "FRA1": "Mike Maignan (GK)",
  "FRA4": "William Saliba",
  "FRA7": "Antoine Griezmann",
  "FRA8": "Aurélien Tchouaméni",
  "FRA9": "Olivier Giroud",
  "FRA10": "Kylian Mbappé",
  "FRA11": "Ousmane Dembélé",

  // Portugal
  "POR1": "Diogo Costa (GK)",
  "POR3": "Rúben Dias",
  "POR8": "Bruno Fernandes",
  "POR10": "Bernardo Silva",
  "POR7": "Cristiano Ronaldo",
  "POR11": "João Félix",

  // España
  "ESP1": "Unai Simón (GK)",
  "ESP3": "Robin Le Normand",
  "ESP8": "Pedri González",
  "ESP9": "Gavi",
  "ESP10": "Lamine Yamal",
  "ESP11": "Nico Williams",
  "ESP19": "Álvaro Morata",

  // Inglaterra
  "ENG1": "Jordan Pickford (GK)",
  "ENG4": "John Stones",
  "ENG8": "Declan Rice",
  "ENG10": "Jude Bellingham",
  "ENG7": "Bukayo Saka",
  "ENG9": "Harry Kane",
  "ENG11": "Phil Foden",

  // Alemania
  "GER1": "Marc-André ter Stegen (GK)",
  "GER4": "Antonio Rüdiger",
  "GER8": "Toni Kroos",
  "GER10": "Florian Wirtz",
  "GER7": "Kai Havertz",
  "GER9": "Niclas Füllkrug",
  "GER11": "Jamal Musiala",

  // Uruguay
  "URU1": "Sergio Rochet (GK)",
  "URU4": "Ronald Araujo",
  "URU8": "Federico Valverde",
  "URU9": "Luis Suárez",
  "URU10": "Giorgian De Arrascaeta",
  "URU11": "Darwin Núñez",

  // Colombia
  "COL1": "Camilo Vargas (GK)",
  "COL4": "Davinson Sánchez",
  "COL10": "James Rodríguez",
  "COL7": "Luis Díaz",
  "COL9": "Rafael Santos Borré",

  // Italia
  "ITA1": "Gianluigi Donnarumma (GK)",
  "ITA10": "Federico Chiesa",

  // Croatia
  "CRO10": "Luka Modrić",

  // Norway
  "NOR9": "Erling Haaland",
  "NOR10": "Martin Ødegaard"
};

export function getStickersForSection(sectionCode: string): { id: string; num: string; name: string }[] {
  const stickers = [];
  
  if (sectionCode === "FWC") {
    stickers.push({ id: "FWC00", num: "00", name: STAR_PLAYERS["FWC00"] || "Escudo / Logo" });
    for (let i = 1; i <= 19; i++) {
      const id = `FWC${i}`;
      stickers.push({ id, num: i.toString(), name: STAR_PLAYERS[id] || `Mundial #${i}` });
    }
  } else if (sectionCode === "CC") {
    for (let i = 1; i <= 14; i++) {
      const id = `CC${i}`;
      stickers.push({ id, num: i.toString(), name: STAR_PLAYERS[id] || `Coca-Cola Special #${i}` });
    }
  } else {
    for (let i = 1; i <= 20; i++) {
      const id = `${sectionCode}${i}`;
      stickers.push({ id, num: i.toString(), name: STAR_PLAYERS[id] || `${sectionCode} #${i}` });
    }
  }
  
  return stickers;
}

export const TOTAL_STICKERS_COUNT = 992; // Actual amount according to official Panini list
