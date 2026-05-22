import Discord from "next-auth/providers/discord";
import Twitch from "next-auth/providers/twitch";
import NextAuth from "next-auth";
import { supabaseAdmin } from "@/lib/supabaseadmin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
      Twitch({
    clientId: process.env.AUTH_TWITCH_ID!,
    clientSecret: process.env.AUTH_TWITCH_SECRET!,
  }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      if (!profile) return true;

      const discordProfile = profile as any;

      const discordId = discordProfile.id;
      const username = discordProfile.username;
      const image = discordProfile.image_url;

const { data: existing } = await supabaseAdmin
  .from("profiles")
  .select("id")
  .or(`discord_id.eq.${discordId},Discord_Username.eq.${username}`)
  .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("profiles").insert({
          discord_id: discordId,
          Discord_Username: username,
          discord_image: image,
          role: "user",
        });
      } else {
        await supabaseAdmin
          .from("profiles")
          .update({
            Discord_Username: username,
            discord_image: image,
          })
          .eq("discord_id", discordId);
      }

      return true;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }

      return session;
    },
  },
});