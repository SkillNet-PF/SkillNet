export async function login(email: string, password: string) {
  // MOCK temporal
  return new Promise<{ success: boolean; role: "user" | "provider" }>((resolve) =>
    setTimeout(() => {
      if (email === "user@test.com" && password === "1234") {
        resolve({ success: true, role: "user" });
      } else if (email === "provider@test.com" && password === "1234") {
        resolve({ success: true, role: "provider" });
      } else {
        resolve({ success: false, role: "user" });
      }
    }, 500)
  );
}

export async function register(_name: string, _email: string, _password: string) {
  // MOCK temporal
  return new Promise<{ success: boolean }>((resolve) =>
    setTimeout(() => {
      resolve({ success: true });
    }, 500)
  );
}
