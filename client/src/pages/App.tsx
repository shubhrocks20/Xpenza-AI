import { LoginForm } from "../components/login-form";
import Logo from '/Logo.jpg'
function App() {
  return (
    <>
      <div className="flex  flex-col items-center justify-center gap-6 p-6 bg-muted  h-screen">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <img
                src={Logo}
                className="w-fit object-contain"
              />
            </div>
            Xpenza
          </a>

          <LoginForm />
        </div>
      </div>
    </>
  );
}

export default App;
