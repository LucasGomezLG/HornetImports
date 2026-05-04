import { getResend, EMAIL_FROM, EMAIL_ADMIN, SITE_URL } from "./client";

function base(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f1f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f4f8;padding:40px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
<tr><td style="background:linear-gradient(135deg,#1d2b3a 0%,#263d54 100%);padding:28px 32px">
<span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">Hornet <span style="color:#f5a623">Imports</span></span>
</td></tr>
<tr><td style="padding:32px">${content}</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
<p style="margin:0;font-size:12px;color:#9ca3af">Mensaje automático de Hornet Imports · No respondas a este correo.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#f5a623;color:#ffffff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;margin-top:8px">${label}</a>`;
}

export async function sendLinkCotizacion(to: string, producto: string, cotizacionId: string) {
  const href = `${SITE_URL}/solicitar/${cotizacionId}`;
  await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Tu cotización está lista — ${producto}`,
    html: base(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827">Tu cotización está lista</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6">
        Revisamos tu solicitud para importar <strong style="color:#111827">${producto}</strong> y está lista para confirmarse.
      </p>
      ${btn(href, "Confirmar pedido →")}
      <p style="margin:20px 0 0;font-size:13px;color:#9ca3af">
        O copiá este enlace: <a href="${href}" style="color:#f5a623">${href}</a>
      </p>
    `),
  });
}

export async function sendCotizacionRechazada(to: string, producto: string, motivo?: string) {
  await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Actualización sobre tu cotización — ${producto}`,
    html: base(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827">No pudimos procesar tu solicitud</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
        Lamentablemente no podemos importar <strong style="color:#111827">${producto}</strong> en este momento.
      </p>
      ${motivo ? `<p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f9fafb;padding:16px;border-radius:8px;border-left:3px solid #e5e7eb"><strong>Motivo:</strong> ${motivo}</p>` : ""}
      ${btn(`${SITE_URL}/cotizar`, "Cotizá otro producto →")}
    `),
  });
}

export async function sendPedidoConfirmado(to: string, producto: string, pedidoId: string) {
  await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Pedido confirmado — ${producto}`,
    html: base(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827">¡Pedido confirmado!</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
        Tu pedido de <strong style="color:#111827">${producto}</strong> fue registrado correctamente.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#374151;background:#f0fdf4;padding:16px;border-radius:8px;border-left:3px solid #059669">
        Nuestro equipo te contactará en menos de 24 hs para coordinar los próximos pasos.
      </p>
      ${btn(`${SITE_URL}/pedidos`, "Ver mis pedidos →")}
      <p style="margin:16px 0 0;font-size:13px;color:#9ca3af">
        Número de pedido: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${pedidoId}</code>
      </p>
    `),
  });
}

export async function sendAlertaNuevoPedido(producto: string, pedidoId: string, emailUsuario: string) {
  if (!EMAIL_ADMIN) return;
  await getResend().emails.send({
    from: EMAIL_FROM,
    to: EMAIL_ADMIN,
    subject: `[Hornet] Nuevo pedido — ${producto}`,
    html: base(`
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827">Nuevo pedido confirmado</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;width:100px">Producto</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;color:#111827">${producto}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280">Cliente</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827">${emailUsuario}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#6b7280">ID</td>
          <td style="padding:8px 0;font-size:14px;font-family:monospace;color:#6b7280">${pedidoId}</td>
        </tr>
      </table>
      ${btn(`${SITE_URL}/admin/pedidos`, "Ver en admin →")}
    `),
  });
}
