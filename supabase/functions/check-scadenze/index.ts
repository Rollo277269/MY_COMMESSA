import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

// Invia email tramite Resend API
async function sendEmail(resendKey: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CSSR Commesse <notifiche@cssr-commesse.it>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Resend error ${res.status}: ${body}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Resend send failed:", e);
    return false;
  }
}

function buildEmailHtml(scadenza: any, daysLeft: number, commessaNome: string): string {
  const urgencyColor = daysLeft <= 7 ? "#dc2626" : daysLeft <= 15 ? "#d97706" : "#2563eb";
  const urgencyLabel = daysLeft <= 7 ? "URGENTE" : daysLeft <= 15 ? "ATTENZIONE" : "PROMEMORIA";
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid ${urgencyColor};">
    <h2 style="color: ${urgencyColor}; margin-top: 0;">[${urgencyLabel}] Scadenza imminente</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;">Commessa:</td><td style="padding: 6px 0; font-weight: 600;">${commessaNome}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Scadenza:</td><td style="padding: 6px 0; font-weight: 600;">${scadenza.titolo}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Tipo:</td><td style="padding: 6px 0;">${scadenza.tipo || scadenza.tipo_polizza || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Data scadenza:</td><td style="padding: 6px 0;">${scadenza.data_scadenza}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Giorni rimanenti:</td><td style="padding: 6px 0; color: ${urgencyColor}; font-weight: 700;">${daysLeft} giorni</td></tr>
      ${scadenza.compagnia ? `<tr><td style="padding: 6px 0; color: #6b7280;">Compagnia:</td><td style="padding: 6px 0;">${scadenza.compagnia}</td></tr>` : ''}
      ${scadenza.numero_polizza ? `<tr><td style="padding: 6px 0; color: #6b7280;">N° Polizza:</td><td style="padding: 6px 0;">${scadenza.numero_polizza}</td></tr>` : ''}
      ${scadenza.importo_garantito ? `<tr><td style="padding: 6px 0; color: #6b7280;">Importo garantito:</td><td style="padding: 6px 0;">€ ${Number(scadenza.importo_garantito).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td></tr>` : ''}
    </table>
    <p style="margin-top: 16px; color: #374151; font-size: 14px;">
      Accedi alla dashboard CSSR Commesse per gestire questa scadenza.
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
    Notifica automatica generata da CSSR Commesse · Non rispondere a questa email.
  </p>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Protezione cron: verifica CRON_SECRET header (pg_cron lo invia nell'header)
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret) {
    const reqSecret = req.headers.get('x-cron-secret');
    if (reqSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY non configurata — impossibile inviare email');
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY non configurata' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Scadenze nei prossimi 30 giorni non ancora notificate via email
    const { data: scadenze, error } = await sb
      .from('scadenze')
      .select('*')
      .eq('notificato_email', false)
      .lte('data_scadenza', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('data_scadenza', today.toISOString().split('T')[0]);

    if (error) throw error;

    if (!scadenze || scadenze.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nessuna scadenza da notificare', notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notifiedCount = 0;
    let failedCount = 0;

    for (const scadenza of scadenze) {
      // Recupera dati commessa e proprietario
      const { data: commessa } = await sb
        .from('commessa_data')
        .select('user_id, oggetto_lavori, committente')
        .eq('id', scadenza.commessa_id)
        .maybeSingle();

      if (!commessa?.user_id) {
        console.warn(`Scadenza ${scadenza.id}: commessa senza user_id, skip`);
        continue;
      }

      const { data: profile } = await sb
        .from('profiles')
        .select('email, display_name')
        .eq('id', commessa.user_id)
        .maybeSingle();

      if (!profile?.email) {
        console.warn(`Scadenza ${scadenza.id}: profilo senza email per user ${commessa.user_id}, skip`);
        continue;
      }

      const daysLeft = Math.ceil(
        (new Date(scadenza.data_scadenza).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const commessaNome = commessa.oggetto_lavori || commessa.committente || scadenza.commessa_id;
      const subject = `[CSSR] Scadenza tra ${daysLeft} giorni: ${scadenza.titolo}`;
      const html = buildEmailHtml(scadenza, daysLeft, commessaNome);

      const sent = await sendEmail(RESEND_API_KEY, profile.email, subject, html);

      if (sent) {
        // Marca come notificata SOLO se l'email è stata inviata con successo
        const { error: updateErr } = await sb
          .from('scadenze')
          .update({ notificato_email: true, notificato_30g: true })
          .eq('id', scadenza.id);

        if (updateErr) {
          console.error(`Errore aggiornamento flag scadenza ${scadenza.id}:`, updateErr.message);
        } else {
          notifiedCount++;
          console.log(`Notifica inviata a ${profile.email} per scadenza "${scadenza.titolo}" (${daysLeft}gg)`);
        }
      } else {
        failedCount++;
        console.error(`Invio fallito per scadenza ${scadenza.id} a ${profile.email}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Notifiche completate`,
        notified: notifiedCount,
        failed: failedCount,
        total_checked: scadenze.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('check-scadenze error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
