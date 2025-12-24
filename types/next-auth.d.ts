// import NextAuth from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       name?: string | null;
//       role: "ADMIN" | "SHOPPER" | "CUSTOMER";
//     };
//   }

//   interface User {
//     id: string;
//     role: "ADMIN" | "SHOPPER" | "CUSTOMER";
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: "ADMIN" | "SHOPPER" | "CUSTOMER";
//   }
// }

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
