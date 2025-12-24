// import NextAuth, { type NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// /* -----------------------------------------------------
//    AUTH OPTIONS
// ----------------------------------------------------- */
// export const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt",
//   },

//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user || !user.passwordHash) {
//           return null;
//         }

//         const isValid = await bcrypt.compare(
//           credentials.password,
//           user.passwordHash
//         );

//         if (!isValid) {
//           return null;
//         }

//         /* ✅ Return SAFE user object (NO PASSWORD) */
//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           role: user.role,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     /* ---------------- JWT ---------------- */
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = (user as any).role;
//       }
//       return token;
//     },

//     /* ---------------- SESSION ---------------- */
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as "ADMIN" | "SHOPPER" | "CUSTOMER";
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },
// };

// /* -----------------------------------------------------
//    NEXTAUTH HANDLER
// ----------------------------------------------------- */
// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * NextAuth configuration
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "SHOPPER" | "CUSTOMER";
      }
      return session;
    },
  },

  

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);