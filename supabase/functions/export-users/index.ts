import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is authenticated
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Check if user has franqueadora or super_admin role via SECURITY DEFINER function
    const [franqueadoraRole, superAdminRole] = await Promise.all([
      anonClient.rpc("has_role", { _user_id: userId, _role: "franqueadora" }),
      anonClient.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);

    if (franqueadoraRole.error || superAdminRole.error) {
      console.error("Role check error:", franqueadoraRole.error || superAdminRole.error);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasAccess = Boolean(franqueadoraRole.data || superAdminRole.data);
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to list auth users
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) throw error;
      if (!data?.users?.length) break;
      allUsers.push(
        ...data.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          phone: u.phone || "",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || "",
          email_confirmed_at: u.email_confirmed_at || "",
          provider: u.app_metadata?.provider || "",
        }))
      );
      if (data.users.length < perPage) break;
      page++;
    }

    return new Response(JSON.stringify(allUsers), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
