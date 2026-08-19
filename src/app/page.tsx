// A home é a LP de campanha ("Você investe. O retorno vem!").
// Fonte única em (public)/lp — /lp segue no ar para as campanhas que já apontam pra lá.
// A home institucional antiga ficou preservada em /home-institucional-x7k2 (noindex).
export { default, metadata } from "./(public)/lp/page";

// O Next exige o valor literal aqui (não pode ser reexportado) — manter igual ao da LP.
export const revalidate = 3600;
