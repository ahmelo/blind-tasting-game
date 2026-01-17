export type Limpidity = "limpido" | "turvo";
export type ColorType = "branco" | "rose" | "tinto";
export type Condition = "correto" | "defeituoso";
export type Sweetness = "seco" | "demi-sec" | "doce";
export type Quality = "pobre" | "aceitavel" | "boa" | "muito_boa" | "excelente";
export type Grape = "Airén" | "Albariño" | "Barbera" | "Cabernet Franc" | "Cabernet Sauvignon" | "Chardonnay" | "Chenin Blanc" | "Colombard" | "Gamay" | "Garnacha" | "Gewürztraminer" | "Macabeo" | "Malbec" | "Merlot" | "Monastrell" | "Moscato" | "Nebbiolo" | "Pinot Grigio" | "Pinot Noir" | "Riesling" | "Sangiovese" | "Sauvignon Blanc" | "Semillon" | "Syrah" | "Tempranillo" | "Touriga Nacional" | "Trebbiano" | "Verdejo" | "Viognier" | "Zinfandel";
export type Country = "África do Sul" | "Alemanha" | "Argentina" | "Armênia" | "Austrália" | "Áustria" | "Bélgica" | "Bolívia" | "Brasil" | "Bulgária" | "Canadá" | "Chile" | "China" | "Croácia" | "Dinamarca" | "Eslovênia" | "Espanha" | "Estados Unidos" | "França" | "Geórgia" | "Grécia" | "Hungria" | "Israel" | "Itália" | "Líbano" | "Macedônia do Norte" | "Marrocos" | "México" | "Moldávia" | "Nova Zelândia" | "Países Baixos" | "Portugal" | "Reino Unido" | "República Tcheca" | "Romênia" | "Suíça" | "Tailândia" | "Tunísia" | "Uruguai";

export type EvaluationCreate = {
  participant_id: string;
  round_id: string;
  limpidity: Limpidity;
  visualIntensity: number; // 1..5
  color_type: ColorType;
  color_tone: string;

  condition: Condition;
  aromaIntensity: number; // 1..5
  aromas: string;
  
  sweetness: Sweetness;
  tannin?: number; // 1..5
  alcohol: number; // 1..5
  consistence: number; // 1..5
  acidity: number; // 1..5
  persistence: number; // 1..5
  flavors: string;

  quality: Quality;
  grape: Grape;
  country: Country;
  vintage: number;
  
  is_answer_key?: boolean;
};

export type EvaluationResponse = EvaluationCreate & {
  id: string;
  score: number;
  submitted_at: string;
};


