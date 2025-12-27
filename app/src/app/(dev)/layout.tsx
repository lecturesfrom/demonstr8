/**
 * Dev Route Group Layout
 * 
 * This layout applies to all routes under (dev)/ route group
 * Route groups don't affect the URL structure - (dev) is ignored
 */

export default function DevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}