export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // check for authentication
  return (
    <div>
      <h1>CUSTOMER</h1>
      {children}
    </div>
  );
}
