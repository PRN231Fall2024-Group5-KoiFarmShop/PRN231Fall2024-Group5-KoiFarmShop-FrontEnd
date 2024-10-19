export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // check for authentication
  return <div>{children}</div>;
}
