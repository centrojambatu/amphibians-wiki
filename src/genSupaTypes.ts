require("dotenv").config({path: ".env.local"});
const {execSync} = require("child_process");

try {
  execSync(
    `npx supabase gen types typescript --project-id ${process.env.NEXT_PUBLIC_SUPABASE_REF_ID!} --schema public > src/types/supabase.ts`,
  );
  console.log("Supabase types generated successfully!");
} catch (error) {
  console.error("Error generating Supabase types:", error);
}
