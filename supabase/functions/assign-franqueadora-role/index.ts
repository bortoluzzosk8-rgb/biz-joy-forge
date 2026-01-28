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
    const { user_id, name, email, phone } = await req.json()

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

    // Check if user already has a franchise
    const { data: existingFranchise } = await supabaseAdmin
      .from('user_franchises')
      .select('franchise_id')
      .eq('user_id', user_id)
      .maybeSingle()

    let franchiseId = existingFranchise?.franchise_id

    // Create franchise if doesn't exist and we have the data
    if (!franchiseId && name) {
      // Calcular data de fim do trial (10 dias a partir de agora)
      const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: franchise, error: franchiseError } = await supabaseAdmin
        .from('franchises')
        .insert({
          name: name,
          email: email || userEmail,
          phone: phone || null,
          city: 'A definir',
          status: 'active',
          parent_franchise_id: null, // Marca como franquia raiz (cliente SaaS)
          trial_ends_at: trialEndsAt,
          subscription_status: 'trial'
        })
        .select()
        .single()

      if (franchiseError) {
        console.error('Error creating franchise:', franchiseError)
        return new Response(
          JSON.stringify({ error: 'Failed to create franchise' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      franchiseId = franchise.id
      console.log(`Created franchise: ${franchise.id} for user: ${user_id}`)

      // Link user to franchise
      const { error: linkError } = await supabaseAdmin
        .from('user_franchises')
        .insert({
          user_id: user_id,
          franchise_id: franchiseId,
          name: name
        })

      if (linkError) {
        console.error('Error linking user to franchise:', linkError)
        return new Response(
          JSON.stringify({ error: 'Failed to link user to franchise' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Linked user ${user_id} to franchise ${franchiseId}`)
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
      JSON.stringify({ 
        success: true, 
        message: 'Role assigned and franchise created successfully', 
        isSuperAdmin,
        franchiseId 
      }),
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
