import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

function getClient() {
  if (!_client) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error("MP_ACCESS_TOKEN no configurado");
    _client = new MercadoPagoConfig({ accessToken: token });
  }
  return _client;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hornetimports.com";

export async function crearPreferencia(pedidoId: string, producto: string, montoArs: number) {
  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: [{ id: pedidoId, title: producto, quantity: 1, unit_price: montoArs, currency_id: "ARS" }],
      external_reference: pedidoId,
      back_urls: {
        success: `${SITE}/pago/exitoso`,
        pending: `${SITE}/pago/pendiente`,
        failure: `${SITE}/pago/fallido`,
      },
      auto_return: "approved",
      notification_url: `${SITE}/api/mp/webhook`,
    },
  });
  return result;
}

export async function obtenerPago(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
