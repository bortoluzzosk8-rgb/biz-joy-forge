import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email autorizado para ser Super Admin
const SUPER_ADMIN_EMAILS = ['bortoluzzosk8@gmail.com']

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar o email do usuário
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (userError || !userData?.user?.email) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userEmail = userData.user.email.toLowerCase()
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail)

    // Verificar se o usuário já tem o role super_admin (se aplicável)
    if (isSuperAdmin) {
      const { data: existingSuperAdminRole } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('user_id', user_id)
        .eq('role', 'super_admin')
        .maybeSingle()

      if (!existingSuperAdminRole) {
        // Inserir role super_admin
        const { error: superAdminError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: user_id,
            role: 'super_admin'
          })

        if (superAdminError) {
          console.error('Error inserting super_admin role:', superAdminError)
        } else {
          console.log(`Successfully assigned super_admin role to user: ${user_id}`)
        }
      }
    }

    // Check if user already has the franqueadora role
    const { data: existingRole, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', user_id)
      .eq('role', 'franqueadora')
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing role:', checkError)
      return new Response(
        JSON.stringify({ error: 'Failed to check existing role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If role already exists, return success
    if (existingRole) {
      return new Response(
        JSON.stringify({ success: true, message: 'Role already assigned', isSuperAdmin }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert the franqueadora role for the user
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user_id,
        role: 'franqueadora'
      })

    if (insertError) {
      console.error('Error inserting role:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to assign role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully assigned franqueadora role to user: ${user_id}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Role assigned successfully', isSuperAdmin }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
