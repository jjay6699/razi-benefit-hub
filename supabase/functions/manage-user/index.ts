import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { action, userId, email, password, fullName, companyId, role } = await req.json()

    console.log('Manage user action:', action, 'for user:', userId)

    switch (action) {
      case 'delete':
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        
        // Also delete the profile
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('user_id', userId)

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_email':
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: email
        })
        if (emailError) throw emailError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_password':
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: password
        })
        if (passwordError) throw passwordError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update_profile':
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: fullName,
            company_id: companyId || null,
            role: role
          })
          .eq('user_id', userId)

        if (profileError) throw profileError

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error managing user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})