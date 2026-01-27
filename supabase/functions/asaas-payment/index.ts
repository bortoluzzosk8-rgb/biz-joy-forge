import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
// Production URL (use sandbox URL for testing: https://sandbox.asaas.com/api/v3)
const ASAAS_BASE_URL = 'https://api.asaas.com/api/v3';

interface CustomerData {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

interface PaymentData {
  customer: string; // Asaas customer ID
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string; // Our sale_payment ID
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log(`[Asaas] Action: ${action}`);

    if (!ASAAS_API_KEY) {
      console.error('[Asaas] API Key not configured');
      return new Response(
        JSON.stringify({ error: 'API Key do Asaas não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    console.log(`[Asaas] Request body:`, JSON.stringify(body));

    switch (action) {
      case 'create-customer': {
        const { name, cpfCnpj, email, phone } = body as CustomerData;
        
        if (!name || !cpfCnpj) {
          return new Response(
            JSON.stringify({ error: 'Nome e CPF/CNPJ são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if customer already exists
        const searchResponse = await fetch(
          `${ASAAS_BASE_URL}/customers?cpfCnpj=${cpfCnpj.replace(/\D/g, '')}`,
          {
            headers: {
              'access_token': ASAAS_API_KEY,
            },
          }
        );
        const searchData = await searchResponse.json();
        console.log('[Asaas] Customer search result:', JSON.stringify(searchData));

        if (searchData.data && searchData.data.length > 0) {
          return new Response(
            JSON.stringify({ customer: searchData.data[0] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create new customer
        const createResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: 'POST',
          headers: {
            'access_token': ASAAS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
            email,
            phone: phone?.replace(/\D/g, ''),
          }),
        });
        
        const customerData = await createResponse.json();
        console.log('[Asaas] Customer created:', JSON.stringify(customerData));

        if (customerData.errors) {
          return new Response(
            JSON.stringify({ error: customerData.errors[0]?.description || 'Erro ao criar cliente' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ customer: customerData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-payment': {
        const { customer, billingType, value, dueDate, description, externalReference } = body as PaymentData;
        
        if (!customer || !billingType || !value || !dueDate) {
          return new Response(
            JSON.stringify({ error: 'Dados incompletos para criar cobrança' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const paymentPayload: Record<string, unknown> = {
          customer,
          billingType,
          value,
          dueDate,
          description: description || 'Pagamento de locação',
          externalReference,
        };

        const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
          method: 'POST',
          headers: {
            'access_token': ASAAS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentPayload),
        });

        const paymentData = await paymentResponse.json();
        console.log('[Asaas] Payment created:', JSON.stringify(paymentData));

        if (paymentData.errors) {
          return new Response(
            JSON.stringify({ error: paymentData.errors[0]?.description || 'Erro ao criar cobrança' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If PIX, get QR Code
        let pixData = null;
        if (billingType === 'PIX' && paymentData.id) {
          const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentData.id}/pixQrCode`, {
            headers: {
              'access_token': ASAAS_API_KEY,
            },
          });
          pixData = await pixResponse.json();
          console.log('[Asaas] PIX QR Code:', JSON.stringify(pixData));
        }

        return new Response(
          JSON.stringify({ 
            payment: paymentData,
            pix: pixData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-payment-status': {
        const { paymentId } = body;
        
        if (!paymentId) {
          return new Response(
            JSON.stringify({ error: 'ID do pagamento é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const statusResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
          headers: {
            'access_token': ASAAS_API_KEY,
          },
        });

        const statusData = await statusResponse.json();
        console.log('[Asaas] Payment status:', JSON.stringify(statusData));

        return new Response(
          JSON.stringify({ payment: statusData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-pix-qrcode': {
        const { paymentId } = body;
        
        if (!paymentId) {
          return new Response(
            JSON.stringify({ error: 'ID do pagamento é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}/pixQrCode`, {
          headers: {
            'access_token': ASAAS_API_KEY,
          },
        });

        const pixData = await pixResponse.json();
        console.log('[Asaas] PIX QR Code:', JSON.stringify(pixData));

        return new Response(
          JSON.stringify({ pix: pixData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'webhook': {
        // Handle Asaas webhook notifications
        console.log('[Asaas] Webhook received:', JSON.stringify(body));
        
        const { event, payment } = body;
        
        if (!payment?.externalReference) {
          console.log('[Asaas] No external reference, ignoring webhook');
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Map Asaas status to our status
        let newStatus = 'pending';
        if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
          newStatus = 'paid';
        } else if (event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED') {
          newStatus = 'cancelled';
        }

        // Update payment in database
        const { error } = await supabase
          .from('sale_payments')
          .update({
            asaas_status: payment.status,
            status: newStatus,
            payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
          })
          .eq('id', payment.externalReference);

        if (error) {
          console.error('[Asaas] Error updating payment:', error);
        } else {
          console.log(`[Asaas] Payment ${payment.externalReference} updated to ${newStatus}`);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('[Asaas] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
