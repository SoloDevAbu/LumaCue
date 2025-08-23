
export default function AuthScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="card center">
      <h2>Welcome to LumaCue</h2>
      <p className="">
        Please sign in or sign up to continue (auth not implemented for MVP)
      </p>
      <div 
        className="flex gap-3 items-center justify-center mt-6"
      >
        <button onClick={onSignIn}>Sign In</button>
        <button onClick={onSignIn}>Sign Up</button>
      </div>
    </div>
  );
}

