// Portuguese first-name → gender dictionary
const MALE = new Set([
  "afonso","alberto","alexandre","álvaro","andré","antonio","antónio","artur","bernardo",
  "bruno","carlos","christian","cláudio","cristiano","daniel","dário","david","diogo",
  "duarte","edgar","eduardo","emanuel","ernesto","fabio","fábio","felipe","fernando",
  "filipe","francisco","frederico","gabriel","gaspar","gilberto","gonçalo","gustavo",
  "hélder","henrique","hugo","igor","ivan","jaime","joão","joaquim","joel","jorge",
  "josé","leandro","leonardo","lourenço","lucas","lúcio","luis","luís","manuel","marco",
  "marcos","martim","mateus","matias","miguel","nelson","nuno","oscar","óscar","paulo",
  "pedro","rafael","raul","renato","ricardo","roberto","rodrigo","rui","salvador",
  "samuel","santiago","sebastião","sérgio","simão","tiago","tomas","tomás","tomé",
  "valentim","vasco","vicente","vítor","xavier",
]);

const FEMALE = new Set([
  "adriana","alexandra","alice","amélia","ana","andreia","ângela","bárbara","beatriz",
  "bianca","bruna","camila","carla","carlota","carmen","carolina","catarina","cátia",
  "cláudia","clotilde","conceição","constança","cristina","daniela","débora","diana",
  "dulce","eduarda","elena","elisabete","elisa","elvira","emília","érica","eva",
  "fátima","fernanda","filipa","filomena","francisca","gabriela","graça","helena",
  "inês","irene","iris","isabel","íris","joana","josefina","júlia","lara","laura",
  "leonor","letícia","lídia","liliana","luana","lúcia","luísa","madalena","manuela",
  "margarida","maria","mariana","marta","matilde","melissa","micaela","mónica",
  "natália","nicole","patrícia","paula","raquel","renata","rita","rosa","rute",
  "sandra","sara","sílvia","simone","sofia","solange","sónia","susana","tatiana",
  "teresa","vanessa","vera","vitória",
]);

export type Gender = "M" | "F" | "U";

export function detectGender(fullName: string): Gender {
  const first = fullName.trim().split(/\s+/)[0]?.toLowerCase();
  if (!first) return "U";
  if (MALE.has(first)) return "M";
  if (FEMALE.has(first)) return "F";
  return "U";
}

export function genderEmoji(g: Gender): string {
  if (g === "M") return "🔵";
  if (g === "F") return "🌸";
  return "⚪";
}
