import "next-auth";

// next-auth v5 (beta) uses @auth/core/types for module augmentation
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}
