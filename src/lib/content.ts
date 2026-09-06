/** Scaffolded content fields (tradeoff/ownership, engagement descriptions, the
 *  availability line) get an honest `TODO(jagadeesh): ...` value in the data
 *  layer until real copy lands — see issues #206/#207/#209. That marker is for
 *  him reading `portfolio.ts`, not for a site visitor: render nothing rather
 *  than a raw TODO string on the live page. */
export const isPlaceholder = (value?: string): boolean => !!value && value.startsWith('TODO(')
