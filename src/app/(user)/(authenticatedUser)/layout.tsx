export default function AuthedUser({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // check for authentication
  return (
    <div>
      <h1>AUTHENTICATED USER</h1>
      {children}
    </div>
  );
}
