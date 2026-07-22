import { createContext, useContext } from 'react'

const SiteConfigContext = createContext({ siteName: 'FitPoly' })

export function SiteConfigProvider({ siteName, children }) {
  return <SiteConfigContext.Provider value={{ siteName }}>{children}</SiteConfigContext.Provider>
}

// Falls back to 'FitPoly' (the software's own name) until an admin has
// completed setup and given their organisation a name/abbreviation.
export function useSiteConfig() {
  return useContext(SiteConfigContext)
}
