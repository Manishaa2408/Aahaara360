// File Location: supabase/functions/get-similar-foods/index.ts

// UPDATED: Modern Deno standard library import
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// UPDATED: Correct import for Supabase client in a Deno environment
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestData {
  foodId: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { foodId }: RequestData = await req.json();
    if (!foodId) {
      throw new Error("A 'foodId' is required in the request body.");
    }

    // This part is the same and is correct
    const supabaseClient: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: sourceFood, error: sourceError } = await supabaseClient
      .from('foods')
      .select('embedding')
      .eq('id', foodId)
      .single();

    if (sourceError) throw sourceError;

    const { data: similarFoods, error: rpcError } = await supabaseClient
      .rpc('match_foods', {
        query_embedding: sourceFood.embedding,
        match_threshold: 0.6,
        match_count: 5,
      })
      .neq('id', foodId);

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify({ similarFoods }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});