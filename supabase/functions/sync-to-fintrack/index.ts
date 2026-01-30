// ============================================
// Shift - FinTrack Integration Edge Function
// ============================================
//
// This Edge Function syncs paychecks to the FinTrack budget tracker.
// It is triggered by a Database Webhook when a paycheck is inserted/updated
// with is_synced_to_budget = true.
//
// Deployment:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref <your-project-ref>
// 4. Deploy: supabase functions deploy sync-to-fintrack
//
// Environment Variables (set in Supabase Dashboard > Edge Functions):
// - FINTRACK_URL: The FinTrack API URL
// - FINTRACK_KEY: The FinTrack API key for authentication
//
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaycheckRecord {
  id: string
  user_id: string
  position_id: string
  reference_date: string
  net_amount: number
  gross_amount: number | null
  bonuses: number
  is_synced_to_budget: boolean
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: PaycheckRecord
  schema: string
  old_record: PaycheckRecord | null
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const FINTRACK_URL = Deno.env.get('FINTRACK_URL')
    const FINTRACK_KEY = Deno.env.get('FINTRACK_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!FINTRACK_URL || !FINTRACK_KEY) {
      console.error('Missing FinTrack configuration')
      return new Response(
        JSON.stringify({ error: 'FinTrack not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json()
    console.log('Received webhook payload:', payload.type, payload.table)

    // Only process paychecks table
    if (payload.table !== 'paychecks') {
      return new Response(
        JSON.stringify({ message: 'Ignored: not a paychecks event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paycheck = payload.record

    // Only sync if is_synced_to_budget is true
    if (!paycheck.is_synced_to_budget) {
      return new Response(
        JSON.stringify({ message: 'Ignored: sync not enabled for this paycheck' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Skip if this is an update and sync status didn't change
    if (payload.type === 'UPDATE' && payload.old_record?.is_synced_to_budget === true) {
      return new Response(
        JSON.stringify({ message: 'Ignored: already synced' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client to fetch position details
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get position and company details for the transaction description
    const { data: position, error: posError } = await supabase
      .from('positions')
      .select('job_title, companies(name)')
      .eq('id', paycheck.position_id)
      .single()

    if (posError) {
      console.error('Error fetching position:', posError)
    }

    // Format the reference date
    const refDate = new Date(paycheck.reference_date)
    const monthYear = refDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Prepare FinTrack transaction
    const transaction = {
      amount: paycheck.net_amount + paycheck.bonuses,
      type: 'income',
      category: 'Salary',
      description: `${monthYear} - ${position?.job_title || 'Salary'} @ ${position?.companies?.name || 'Unknown'}`,
      date: paycheck.reference_date,
      source: 'shift',
      external_id: paycheck.id,
      metadata: {
        net_amount: paycheck.net_amount,
        gross_amount: paycheck.gross_amount,
        bonuses: paycheck.bonuses,
        position_id: paycheck.position_id
      }
    }

    console.log('Sending transaction to FinTrack:', transaction)

    // Send to FinTrack API
    const response = await fetch(`${FINTRACK_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINTRACK_KEY}`,
        'X-Source': 'shift'
      },
      body: JSON.stringify(transaction)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('FinTrack API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'FinTrack sync failed', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    console.log('FinTrack sync successful:', result)

    return new Response(
      JSON.stringify({ success: true, fintrack_id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
